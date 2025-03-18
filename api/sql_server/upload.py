import mysql.connector
import socket
import struct
import os

host_ip="107.21.218.63"
port=57832
'''
Leaving the local file path blank.. Instructions to use:
Windows: path\\to\\local\\file
linux/mac: path/to/local/file
'''
local_file_path = ""
author = 5
chunk_size = 4096


def send_file(host, port_no, data, author_id):
    """Send the file to the database"""
    print(f"Now sending data: {data}")

    #gets the size and file name

    print(f"[*] Uploading {author_id} to {host}:{port_no}")

    #sets up client socket and connects
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((host, port_no))

    filename = "user"+str(author_id)
    #sends file name, length, and size
    client_socket.sendall(struct.pack('!I', len(filename)))
    client_socket.sendall(filename.encode())
    client_socket.sendall(struct.pack('!Q', author_id))


    # Send file content in data
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        client_socket.sendall(chunk.encode())
        print(f"Chunk sent {i}")# Send the chunk
    client_socket.sendall(b"<END>")
    print(f"[!] data sent:{data}, length: {len(data)}")

    print(f"[+] File '{filename}' uploaded successfully")

    client_socket.close()


class MariaDBFileUpload:

    def __init__(self, host="107.21.218.63", user="FourtyEightHours", password="test1234", database="CSI2999"):
        """Connect to the mariaDB database"""
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        self.cursor = self.conn.cursor()
        self.create_file_table()

    def create_file_table(self):
        """Makes sure the file table exists, if not will create the table"""
        query = """
        CREATE TABLE IF NOT EXISTS files (
            id INT,
            filename VARCHAR(255) NOT NULL,
            filepath VARCHAR(500) NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        self.cursor.execute(query)
        self.conn.commit()


    def add_filepath_to_database(self, file_path, author_id):
        """Adds the filepath to the database so the file can be retrieved later"""
        filename = os.path.basename(file_path)
        filepath = "/var/lib/mariadb_files/" + str(author_id) + "/" + filename

        query = "INSERT INTO files (id, filename, filepath) VALUES (%s, %s, %s)"
        try:
            self.cursor.execute(query, (author_id, filename, filepath))
            self.conn.commit()
            print(f"File {filename} from {author_id} has been added to database at {filepath}")

        except mysql.connector.Error as err:
            print(f"Error: {err}")


#TEST
if __name__ == "__main__":
    db = MariaDBFileUpload()

    # test run.. usage: send_file(host_ip, port, 'path/to/local/file'
    send_file(host_ip, port, local_file_path, author)
