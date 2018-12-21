import CMD
import json
import requests


class WhiskExec():

    def __init__(self, ):
        #------------------------------------------------------------------WHISK PARAMS-----------------------------------------------___#

        self.auth_cmd = "/home/waqar/openwhisk/bin/wsk -i property get --auth"

        self.APIHOST = 'https://172.17.0.1'
        self.AUTH_KEY = CMD.get_auth().decode()
        self.NAMESPACE = 'guest'

        self.ACTION = 'samplepy'
        self.PARAMS = {'myKey': 'myValue'}

        self.BLOCKING = 'true'
        self.RESULT = 'true'

        self.url = self.APIHOST + '/api/v1/namespaces/' + self.NAMESPACE + '/actions/' + self.ACTION
        #------------------------------------------------------------------WHISK PARAMS ENDS-----------------------------------------___#


    def invoke_action(self):
        self.user_pass = self.AUTH_KEY.split(':')
        response = requests.post(self.url, json=self.PARAMS, params={'blocking': self.BLOCKING, 'result': self.RESULT},
                                 auth=(self.user_pass[0], self.user_pass[1]), verify=False)

        results = json.loads(response.text)
        print(results)
        return results

