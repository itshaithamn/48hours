from . import filesorting
import socket
import struct


host_ip="107.21.218.63"
port=57832
'''
Leaving the local file path blank.. Instructions to use:
Windows: path\\to\\local\\file
linux/mac: path/to/local/file
'''
local_file_path = ""
author = 7
chunk_size = 4096
db = filesorting.filesorting()

def send_file(host, port_no, data, author_id):
    """Send the file to the database"""
    print(f"Now sending data: {data}")

    #gets the size and file name

    print(f"[*] Uploading {author_id} to {host}:{port_no}")

    #sets up client socket and connects
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((host, port_no))

    filenum = db.upload_file(author_id, data)
    #sends file name, length, and size
    client_socket.sendall(struct.pack('!B', filenum))
    print(f"[*] {filenum} uploaded")
    client_socket.sendall(struct.pack('!Q', author_id))
    print(f"[*] {author_id} uploaded")


    # Send file content in data
    print(data)

    client_socket.sendall(data.encode())
    print(f"[!] data sent:{data}, length: {len(data)}")

    print(f"[+] File '{filenum}' uploaded successfully")

    client_socket.close()


#TEST
if __name__ == "__main__":
    db = filesorting.filesorting()

    # test run.. usage: send_file(host_ip, port, 'path/to/local/file'
    send_file(host_ip, port, "randomfilename", author)
