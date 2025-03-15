import mysql.connector
import bcrypt

class MariaDBAuth:
    def __init__(self, host="107.21.218.63", user="FourtyEightHours", password="test1234", database="CSI2999"):
        """Connect to the MariaDB database."""
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        self.cursor = self.conn.cursor()
        self.create_users_table()
    def create_users_table(self):
        """Ensure the users table exists."""
        query = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL
        )
        """
        self.cursor.execute(query)
        self.conn.commit()

    def hash_password(self, password):
        """Hashes a password using bcrypt."""
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def verify_password(self, password, hashed_password):
        """Verifies the password against the stored hash."""
        return bcrypt.checkpw(password.encode(), hashed_password.encode())

    def add_user(self, username, password):
        """adds a new user to the database and hashes passwrd for security"""
        hashed_password = self.hash_password(password)
        query = "INSERT INTO users (username, password_hash) VALUES (%s, %s)"
        try:
            self.cursor.execute(query, (username, hashed_password))
            self.conn.commit()
            self.cursor.fetchall()
            print(f"User '{username}' added successfully.")
        except mysql.connector.Error as e:
            print(f"Error: {e}")

    def verify_unique_username(self, username):
        """Verifies if the username already exists."""
        query = "SELECT username FROM users WHERE username = %s"

        self.cursor.execute(query, (username,))
        print("executed 2")
        result = self.cursor.fetchone()
        if result == None:
            result = ("x")
        else:
            result = result
        print(f"executed 4 {result}")

        try:
            if username in result:
                return False
            else:
                print(username in result)
                return True
        except mysql.connector.Error as e:
            print(f"Error: {e}")
            return False

    def authenticate_user(self, username, password):
        """check if username/password are correct. Return True/False """
        query = "SELECT password_hash FROM users WHERE username = %s"
        self.cursor.execute(query, (username,))
        result = self.cursor.fetchone()
        if result:
            return self.verify_password(password, result[0])
        return False

    def close(self):
        """Close the database connection."""
        self.cursor.close()
        self.conn.close()


# test
if __name__ == "__main__":
    db = MariaDBAuth()

    db.verify_unique_username("admin")

    db.close()