import mysql.connector
import os

class filesorting:
    def __init__(self, host="107.21.218.63", user="FourtyEightHours", password="test1234", database="CSI2999"):
        """Connect to mariaDB database"""
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
        )
        self.cursor = self.conn.cursor()

    def get_current_highest_file_id(self, author):
        """Check what the current highest file id is for user author"""
        query = "SELECT fileno FROM userfiles WHERE id = %s"
        self.cursor.execute(query, (author,))
        result = self.cursor.fetchall()
        try:
            largest_id = max(list(sum(result, ())))
            return largest_id + 1
        finally:
            return 1
    def upload_file(self, author, filename):
        """Upload a file to database"""
        highest_file_id = self.get_current_highest_file_id(author)

        query = "INSERT INTO userfiles (id, fileno, filename) VALUES (%s, %s, %s)"
        try:
            self.cursor.execute(query, (author, highest_file_id, filename))
            self.conn.commit()
            return highest_file_id
        except mysql.connector.Error as err:
            print(f"Something went wrong: {err}")

        filepath = "/var/lib/mariadb_files/" + str(author) +"/" + str(highest_file_id)


if __name__ == "__main__":
    db = filesorting()
    db.get_current_highest_file_id(4)