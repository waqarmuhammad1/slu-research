# -*- coding: utf-8 -*-
import CMD
from flask import Flask, request, json
from flask_restful import Resource, Api
from flask_cors import CORS
import pandas as pd
from DataHolder import DataHolder
from DBXExec import DBXExec
from OpenWhiskExec import WhiskExec
from DockerExec import DockerExec



app = Flask(__name__)

CORS(app)

api = Api(app)


#*********************************************  GLOBAL PARAMETERS   *******************************************************************

holder = DataHolder()

#**************************************************************************************************************************************

class upload(Resource):
    def post(self):
        request_data = json.loads(request.data.decode())

        data = request_data['data']
        for x in data:
            for y in x.keys():
                holder.excel_data[y] = pd.DataFrame.from_dict(x[y])
                holder.form_data[y] = x[y]

class get_data(Resource):
    def post(self):

        request_data = json.loads(request.data.decode())
        required_sheet = request_data['sheet_name']

        column_names = list(holder.excel_data[required_sheet].keys())
        data = holder.form_data[required_sheet]

        resp = {'column_names': column_names, 'data': data}

        holder.sheet_name = request_data['sheet_name']

        return resp


class get_columns(Resource):
    def post(self):

        request_data = json.loads(request.data.decode())
        required_sheet = request_data['sheet_name']

        column_names = list(holder.excel_data[required_sheet].keys())
        return column_names

class get_training_vars(Resource):
    def post(self):
        request_data = json.loads(request.data.decode())

        holder.training_cols = request_data['train']
        holder.train_df = holder.excel_data[holder.sheet_name][holder.training_cols]



class get_target_vars(Resource):
    def post(self):
        request_data = json.loads(request.data.decode())
        holder.target_cols = request_data['target']
        holder.target_df = holder.excel_data[holder.sheet_name][holder.target_cols]


class get_form_data(Resource):
    def post(self):
        all_cols = holder.target_cols + holder.training_cols

        resp_data = []
        for x in holder.form_data[holder.sheet_name]:
            resp_dic = {}
            for y in x.keys():
                if y in all_cols:
                    resp_dic[y] = x[y]
            resp_data.append(resp_dic)


        return {'sheet_name': holder.sheet_name, 'data':resp_data, "column_names": all_cols}


class apply_algos(Resource):
    def post(self):
        request_data = json.loads(request.data.decode())
        holder.algos = list(request_data['target'])
        # holder.iterations = str(request_data['iterations']).strip()

        # if  holder.iterations.isdigit():
        #     holder.iterations = int(holder.iterations)
        # else:
        #     holder.iterations = 1

        CMD.create_dir()
        holder.save_data('data/data.xlsx')

        trans_dic = {}
        trans_dic['training_vars'] = holder.training_cols
        trans_dic['target_vars'] = holder.target_cols
        trans_dic['algos'] = holder.algos
        trans_dic['sheet_name'] = holder.sheet_name
        trans_dic['iterations'] = holder.iterations

        with open('data/data.json', 'w') as outFile:
            json.dump(trans_dic, outFile)



        dbx = DBXExec()
        dbx.zip_file('data', 'data')

        dbx.upload_file_to_dbx('data.zip', 'data.zip')

        whisk_exec = WhiskExec()
        docker_exec = DockerExec()

        holder.whisk_result = whisk_exec.invoke_action()
        holder.docker_result = docker_exec.invoke()

        print(holder.whisk_result)
        print(holder.docker_result)

        results = holder.whisk_result['Results']
        samples = holder.whisk_result['Samples']

        elapsed = {}
        elapsed['whisk'] = {'run_time': holder.whisk_result['Elapsed'], 'CI': holder.whisk_result['CI']}
        elapsed['docker'] = {'run_time': holder.docker_result['Elapsed'], 'CI': holder.docker_result['CI']}


        holder.final_results = {'Results': results, 'Samples': samples, 'Elapsed': elapsed}
        return holder.final_results



class get_results(Resource):
    def post(self):

        reslts = holder.final_results

        return reslts

class get_selected_algos(Resource):
    def post(self):

        algo_names = holder.algos

        return algo_names


class get_predicted_data(Resource):
    def post(self):

        predicted_data = holder.predicted_vals

        return predicted_data


class get_elapsed(Resource):
    def post(self):

        elaps = holder.elapsed

        return elaps

class get_available_algos(Resource):
    def post(self):
        return ['Linear Regression', 'Elastic Net Regression', 'Lars Regression', 'Lasso Regression', 'Support Vector Regressor (SVR)']




api.add_resource(get_available_algos, '/get_ava_algos')
api.add_resource(get_elapsed, '/get_elapsed')
api.add_resource(get_predicted_data, '/get_pred_vals')
api.add_resource(get_selected_algos,'/get_algos')
api.add_resource(get_results,'/get_results')
api.add_resource(apply_algos,'/apply_algos')
api.add_resource(get_form_data,'/get_selected')
api.add_resource(get_target_vars,'/get_target')
api.add_resource(get_training_vars,'/get_train')
api.add_resource(get_columns,'/get_columns')
api.add_resource(get_data,'/get_data')
api.add_resource(upload,'/upload')



if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1',threaded = True)









# data = exc_data[sheet_name]
# data = data.apply(pd.to_numeric, errors='ignore')
#
#
# ra = Fusion_Analysis(data, train_vars, target_vars, req_algos)
# start = timer()
# fa_results, samples = ra.perform_regression()
# end = timer()
#
# global results
# global algos
# global predicted_vals
# global elapsed
#
#
# algos = req_algos
# results = fa_results
# predicted_vals = samples
# elapsed =  end - start
