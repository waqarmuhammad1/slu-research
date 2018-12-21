import pandas as pd

class DataHolder():

    def __init__(self):

        self.sheet_name = ''
        self.excel_data = {}
        self.form_data = {}
        self.training_cols = []
        self.target_cols = []
        self.algos = []
        self.train_df = None
        self.target_df = None
        self.predicted_vals = None
        self.whisk_result = {}
        self.docker_result = {}
        self.elapsed=None
        self.iterations=None
        self.final_results = {}


    def save_data(self, file_name):

        writer = pd.ExcelWriter(file_name)


        for sheet_name in self.excel_data.keys():
            self.excel_data[sheet_name].to_excel(writer, sheet_name, index=False)


        writer.save()
