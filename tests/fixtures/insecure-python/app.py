DEBUG = True
SECRET_KEY = 'python-super-secret-change-me'
@app.route('/login')
def login():
    print(request.headers)
    return {'success': True}
