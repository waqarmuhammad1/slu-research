import subprocess


def get_auth():
    auth_cmd = "/home/waqar/openwhisk/bin/wsk -i property get --auth"
    return subprocess.check_output(auth_cmd, shell=True).split()[2]

def create_dir():
    dir_cmd = 'mkdir data'
    try:
        subprocess.check_output(dir_cmd, shell=True)
    except:
        remove_dir()
        create_dir()

def remove_dir():
    rm_cmd = 'rm -r data'
    subprocess.check_output(rm_cmd, shell=True)

def get_docker_ip():
    dock_cmd = "docker inspect --format '{{ .NetworkSettings.IPAddress }}' waqar"
    return subprocess.check_output(dock_cmd, shell=True)



# print(get_docker_ip())
#
#
# import requests
#
# url = 'http://'+get_docker_ip().decode().replace('\n','')+':5000/run_code'
# print('http://'+get_docker_ip().decode().replace('\n','')+':5000/run_code')
# resp = requests.post(url, verify=False)
# print(resp.text)
