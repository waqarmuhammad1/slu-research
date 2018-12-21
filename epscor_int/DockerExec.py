import requests
import CMD
import ast

class DockerExec():
    def __init__(self):
        pass


    def invoke(self):
        ip = CMD.get_docker_ip().decode()
        print(ip)
        url = url = 'http://'+ip.replace('\n','')+':5000/run_code'
        response = requests.post(url, verify=False);
        result = ast.literal_eval(response.text)
        print(result)
        return result