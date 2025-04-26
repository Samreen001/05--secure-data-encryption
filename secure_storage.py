import os
import base64
import getpass
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class SecureStorage:
    def __init__(self):
        # In-memory storage for user data
        self._storage = {}
        # Track login attempts
        self._login_attempts = {}
        # Maximum allowed failed attempts before reauthorization
        self.MAX_ATTEMPTS = 3
        # Current logged-in user
        self.current_user = None
        
    def _derive_key(self, passkey, salt=None):
        """Derive encryption key from passkey"""
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(passkey.encode()))
        return key, salt
    
    def register_user(self, username, password):
        """Register a new user"""
        if username in self._storage:
            return False, "Username already exists"
        
        # Hash the password for storage
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Initialize user data
        self._storage[username] = {
            'password_hash': password_hash,
            'data': {},
            'salts': {}
        }
        
        self._login_attempts[username] = 0
        return True, "User registered successfully"
    
    def login(self, username, password):
        """Login a user"""
        if username not in self._storage:
            return False, "User does not exist"
        
        # Check password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if password_hash != self._storage[username]['password_hash']:
            # Increment failed attempts
            self._login_attempts[username] += 1
            remaining = self.MAX_ATTEMPTS - self._login_attempts[username]
            
            if remaining <= 0:
                return False, "Too many failed attempts. Account locked."
            
            return False, f"Incorrect password. {remaining} attempts remaining."
        
        # Reset attempts on successful login
        self._login_attempts[username] = 0
        self.current_user = username
        return True, "Login successful"
    
    def store_data(self, key, value, passkey):
        """Store encrypted data for the current user"""
        if not self.current_user:
            return False, "Not logged in"
        
        # Generate encryption key from passkey
        encryption_key, salt = self._derive_key(passkey)
        
        # Encrypt the data
        fernet = Fernet(encryption_key)
        encrypted_data = fernet.encrypt(value.encode())
        
        # Store the encrypted data and salt
        self._storage[self.current_user]['data'][key] = encrypted_data
        self._storage[self.current_user]['salts'][key] = salt
        
        return True, "Data stored securely"
    
    def retrieve_data(self, key, passkey):
        """Retrieve and decrypt data for the current user"""
        if not self.current_user:
            return False, "Not logged in", None
        
        user_data = self._storage[self.current_user]['data']
        user_salts = self._storage[self.current_user]['salts']
        
        if key not in user_data:
            return False, "Data not found", None
        
        # Get the salt used for this data
        salt = user_salts[key]
        
        # Derive the key using the same salt
        encryption_key, _ = self._derive_key(passkey, salt)
        
        try:
            # Decrypt the data
            fernet = Fernet(encryption_key)
            decrypted_data = fernet.decrypt(user_data[key]).decode()
            return True, "Data retrieved successfully", decrypted_data
        except Exception:
            # Increment failed attempts on decryption failure
            self._login_attempts[self.current_user] += 1
            remaining = self.MAX_ATTEMPTS - self._login_attempts[self.current_user]
            
            if remaining <= 0:
                # Force reauthorization
                self.current_user = None
                return False, "Too many failed attempts. Please login again.", None
            
            return False, f"Incorrect passkey. {remaining} attempts remaining.", None
    
    def logout(self):
        """Logout the current user"""
        if not self.current_user:
            return False, "Not logged in"
        
        self.current_user = None
        return True, "Logged out successfully"
    
    def list_keys(self):
        """List all data keys for the current user"""
        if not self.current_user:
            return False, "Not logged in", None
        
        keys = list(self._storage[self.current_user]['data'].keys())
        return True, "Keys retrieved successfully", keys


def main():
    storage = SecureStorage()
    
    while True:
        print("\n===== Secure Storage System =====")
        
        if storage.current_user:
            print(f"Logged in as: {storage.current_user}")
            print("1. Store Data")
            print("2. Retrieve Data")
            print("3. List Data Keys")
            print("4. Logout")
            print("5. Exit")
        else:
            print("1. Register")
            print("2. Login")
            print("3. Exit")
        
        choice = input("\nEnter your choice: ")
        
        if storage.current_user:
            # Logged in menu
            if choice == '1':
                key = input("Enter data key: ")
                value = input("Enter data value: ")
                passkey = getpass.getpass("Enter passkey for encryption: ")
                
                success, message = storage.store_data(key, value, passkey)
                print(message)
                
            elif choice == '2':
                key = input("Enter data key: ")
                passkey = getpass.getpass("Enter passkey for decryption: ")
                
                success, message, data = storage.retrieve_data(key, passkey)
                print(message)
                
                if success:
                    print(f"Retrieved data: {data}")
                    
            elif choice == '3':
                success, message, keys = storage.list_keys()
                print(message)
                
                if success and keys:
                    print("Your data keys:")
                    for i, key in enumerate(keys, 1):
                        print(f"{i}. {key}")
                elif success:
                    print("No data stored yet.")
                    
            elif choice == '4':
                success, message = storage.logout()
                print(message)
                
            elif choice == '5':
                print("Exiting...")
                break
                
            else:
                print("Invalid choice. Please try again.")
                
        else:
            # Not logged in menu
            if choice == '1':
                username = input("Enter username: ")
                password = getpass.getpass("Enter password: ")
                
                success, message = storage.register_user(username, password)
                print(message)
                
            elif choice == '2':
                username = input("Enter username: ")
                password = getpass.getpass("Enter password: ")
                
                success, message = storage.login(username, password)
                print(message)
                
            elif choice == '3':
                print("Exiting...")
                break
                
            else:
                print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
