import mysql.connector
import socket
import struct
import os

user_id = 5
host_ip = "107.21.218.63"
port = 51832
client_socket = None
output_dir = "C:\\Users\\Devin\\Desktop\\OU\\Winter25\\CSI2999"

class MariaDBFileDownload():
    def __init__(self, host="107.21.218.63", user="FourtyEightHours", password="test1234", database="CSI2999"):
        """Connect to the mariaDB database"""
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        self.cursor = self.conn.cursor()

    def get_saved_user_files_from_database(self, user_id):
        """Get the list of saved user files with their paths from the database"""
        query = "SELECT filename, filepath, uploaded_at FROM files WHERE id = %s"
        self.cursor.execute(query, (user_id,))
        result = self.cursor.fetchall()

        if result:
            return result
        return False

    def download_user_file(self, filepath, host, port_no):

        #Connect to socket
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.connect((host, port_no))
        print(f"[+] Sending request to download user file: {filepath}")

        #send filepath and filepath length
        client_socket.sendall(struct.pack('!I', len(filepath)))
        client_socket.sendall(filepath.encode())


        print("[+] Now downloading requested file")

        while True:
            print("[+] Waiting to receive filepath_length")
            filepath_len_data = client_socket.recv(4)
            if not filepath_len_data:
                break
            #receive the filepath
            print("[+] Received filepath_length_data and now waiting for filepath_len")
            filepath_len = struct.unpack('!I', filepath_len_data)[0]
            filename = client_socket.recv(filepath_len).decode()

            #receive the file size
            file_size_data = client_socket.recv(8)
            file_size = struct.unpack('!Q ', file_size_data)[0]

            print(f"[+] Downloading file: {filename}, ({file_size} bytes)")

            # save the file to a dir
            output_path = os.path.join(output_dir, filename)
            try:
                with open(output_path, mode='wb') as f:
                    bytes_received = 0
                    while bytes_received < file_size:
                        chunk = client_socket.recv(min(4096, file_size - bytes_received))
                        if not chunk:
                            print(f"[!] No data received, connection may be closed")
                            break
                        f.write(chunk)
                        print(f"[+] Sucess adding chunk")
                        bytes_received += len(chunk)
                        print(f"[+] Success adding chunk to bytes_received: {bytes_received}")
                print(f"[+] Downloaded {filename} successfully")
            except Exception as e:
                print(f"[!] Error while downloading: {e}")
        """
        print("[+] Now moving on to receiving - 2")
        file_path_received_data_len = client_socket.recv(4)
        print(f"[+] Received {file_path_received_data_len}")

        # receive filepath
        filepath_len_received = struct.unpack('!I', file_path_received_data_len)[0]
        filepath_received = client_socket.recv(filepath_len_received).decode()
        print(f"[+] Received request to download user file: {filepath_received}")
        """

    def terminate_connection(self):
        print("[+] Connection closing")
        if client_socket:
            print("[+] Successfully closed connection")
            client_socket.close()
#TEST
if __name__ == "__main__":
    db = MariaDBFileDownload()
    #set up the connection to the server

    #Using user_id 5 for now.. Change later when the time comes
    saved_user_files_list = db.get_saved_user_files_from_database(user_id)
    #Change later if needed. The output shouldn't end up print in the end...
    #print(f"User: saved_user_files_list: {user_id}, Filename: {saved_user_files_list[0][0]}, Filepath: {saved_user_files_list[0][1]}, File Date: {saved_user_files_list[0][2]}, File Size: {saved_user_files_list[0][3]}")


    db.download_user_file('/var/lib/mariadb_files/test_file.txt', host_ip, port)

    #After all is done, terminate connection, ONLY CALL AFTER
    db.terminate_connection()