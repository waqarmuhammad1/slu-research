import shutil
import dropbox


class DBXExec():

    def __init__(self):
        self.ACCESS_TOKEN_DBX = 'cWZanGVIB6AAAAAAAAAADmw6myadpkzFdNGuvwODehM8xwA3IVdbarsVg0Aax369'


    def zip_file(self, dest_file_path_name, src_file_path_name):
        # ------------------------------------------------Making ZIP FILE---------------------------------------------------#
        try:
            shutil.make_archive(dest_file_path_name, 'zip', src_file_path_name)
        except:
            raise

    def upload_file_to_dbx(self, path_to_upload, file_name):
        # -------------------------------------------------UPLOAD DROPBOX-----------------------------------------------____#
        try:
            client = dropbox.Dropbox(self.ACCESS_TOKEN_DBX)
            with open(path_to_upload, 'rb') as f:
                mode = dropbox.files.WriteMode.overwrite
                response = client.files_upload(f.read(), path='/' + file_name, mode=mode)
        except:
            raise
