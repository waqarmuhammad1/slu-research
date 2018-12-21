import os
import json
import dropbox
import zipfile
import numpy as np
import pandas as pd
from sklearn import metrics
from flask_cors import CORS
from flask import Flask, request, json
from flask_restful import Resource, Api
from timeit import default_timer as timer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, ElasticNet, Lars, Lasso, LassoLars


class Fusion_Analysis():
    def __init__(self):

        with open('data.json') as dataFile:
            data = json.load(dataFile)

        self.test_size = 0.2
        self.training_vars = data['training_vars']
        self.target_vars = data['target_vars']
        self.data_file_path = 'data.xlsx'
        self.sheet_name = data['sheet_name']
        self.algos = data['algos']
        self.data = self.read_data(self.data_file_path, self.sheet_name)

    def read_data(self, data_file_path, sheet_name):
        filename, file_extension = os.path.splitext(data_file_path)

        if '.csv' in file_extension and os.path.isfile(data_file_path):
            data = pd.read_csv(data_file_path)
            return data

        elif ('.xlsx' in file_extension or '.xls' in file_extension) and os.path.isfile(data_file_path):

            data = pd.ExcelFile(data_file_path)
            if sheet_name is None and len(data.sheet_names) > 1:
                raise Exception(
                    'Multiple sheets found in ' + filename + file_extension + ', please provide sheet name with -s flag')

            if len(data.sheet_names) > 1:
                data = pd.read_excel(data_file_path, sheet_name=sheet_name)
            return data

        else:
            raise Exception('File type not supported')


    def perform_regression(self):
        training_vars = self.data[self.training_vars]

        results = {}
        fit_data = {}

        for x in self.target_vars:
            target_var = self.data[x]
            x_train, x_test, y_train, y_test = train_test_split(training_vars, target_var, test_size=self.test_size)
            samples = {}
            algo_results = {}
            for y in self.algos:

                if 'linear' in y.lower():
                    algo_name = 'Linear Regression'
                    estimated_values = linear_reg(x_train, y_train, x_test)
                    algo_results[algo_name] = calc_metrics(estimated_values, y_test)

                    samples[algo_name] = list(estimated_values)
                elif 'elastic' in y.lower():
                    algo_name = 'Elastic Net Regression'
                    estimated_values = elastic_reg(x_train, y_train, x_test)
                    algo_results[algo_name] = calc_metrics(estimated_values, y_test)

                    samples[algo_name] = list(estimated_values)
                elif 'lars' in y.lower():
                    algo_name = 'Lars Regression'
                    estimated_values = lars_reg(x_train, y_train, x_test)
                    algo_results[algo_name] = calc_metrics(estimated_values, y_test)

                    samples[algo_name] = list(estimated_values)
                elif 'lasso' in y.lower():
                    algo_name = 'Lasso Regression'
                    estimated_values = lasso_reg(x_train, y_train, x_test)
                    algo_results[algo_name] = calc_metrics(estimated_values, y_test)

                    samples[algo_name] = list(estimated_values)

                elif 'lassolars' in y.lower():
                    algo_name = 'LassoLars Regression'
                    estimated_values = lasso_lars_reg(x_train, y_train, x_test)
                    algo_results[algo_name] = calc_metrics(estimated_values, y_test)

                    samples[algo_name] = list(estimated_values)


            results[x] = algo_results
            fit_data[x] = {'predicted':samples, 'Actual': list(y_test)}
        return results, fit_data




app = Flask(__name__)

CORS(app)

api = Api(app)


class Run(Resource):
    def post(self):
        download_file('data.zip')
        unzip_file('data.zip')

        fa = Fusion_Analysis()

        start = timer()
        result, samples = fa.perform_regression()
        end = timer()
        elapsed = end - start

        return {'Results': result, 'Samples': samples, 'Elapsed': str(elapsed)}


# def main(args):
#     download_file('data.zip')
#     unzip_file('data.zip')
#
#     fa = Fusion_Analysis()
#
#     start = timer()
#     result, samples = fa.perform_regression()
#     end = timer()
#     elapsed = end - start
#
#     return {'Results': result, 'Samples': samples, 'Elapsed': str(elapsed)}


def filter_nan(s, o):
    data = np.array([s.flatten(), o.flatten()])
    data = np.transpose(data)
    data = data[~np.isnan(data).any(1)]
    return data[:, 0], data[:, 1]


def calc_nash(s, o):
    s, o = filter_nan(s, o)
    return 1 - sum((s - o) ** 2) / sum((o - np.mean(o)) ** 2)


def calc_metrics(y_pred, y_test):
    rmse = np.sqrt(metrics.mean_squared_error(y_test, y_pred))
    nash = calc_nash(y_pred, y_test.values)
    rel_rmse = 100 * (rmse / np.mean(y_test))
    return json.dumps({'RMSE': rmse, 'RMSE%': rel_rmse, 'Nash': nash})

def unzip_file(file_name):
    # ------------------------------------------------EXTRACT ZIP FILE----------------------------------------------------#
    with zipfile.ZipFile(file_name) as zip:
        for zip_info in zip.infolist():
            if zip_info.filename[-1] == '/':
                continue
            zip_info.filename = os.path.basename(zip_info.filename)
            zip.extract(zip_info)


def download_file(file_name):
    # -------------------------------------------------Download DROPBOX-----------------------------------------------____#
    ACCESS_TOKEN_DB = 'cWZanGVIB6AAAAAAAAAADmw6myadpkzFdNGuvwODehM8xwA3IVdbarsVg0Aax369'
    client = dropbox.Dropbox(ACCESS_TOKEN_DB)
    metadata, res = client.files_download('/' + file_name)
    out = open(file_name, 'wb')
    out.write(res.content)
    out.close()


def linear_reg(X_train, y_train, X_test):
    linreg = LinearRegression()
    linreg.fit(X_train, y_train)
    y_pred = linreg.predict(X_test)
    return y_pred


def elastic_reg(X_train, y_train, X_test):
    e_reg = ElasticNet()
    e_reg.fit(X_train, y_train)
    y_pred = e_reg.predict(X_test)
    return y_pred


def lars_reg(X_train, y_train, X_test):
    lars_reg = Lars()
    lars_reg.fit(X_train, y_train)
    y_pred = lars_reg.predict(X_test)
    return y_pred


def lasso_reg(X_train, y_train, X_test):
    lasso_reg = Lasso()
    lasso_reg.fit(X_train, y_train)
    y_pred = lasso_reg.predict(X_test)
    return y_pred


def lasso_lars_reg(X_train, y_train, X_test):
    least_lars_reg = LassoLars()
    least_lars_reg.fit(X_train, y_train)
    y_pred = least_lars_reg.predict(X_test)
    return y_pred




api.add_resource(Run, '/run_code')

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1',threaded = True)