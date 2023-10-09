from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__, template_folder='templates')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///backend.db'
CORS(app)
db = SQLAlchemy(app)

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_content = db.Column(db.String(200), nullable=False)
    last_modified = db.Column(db.DateTime)
    completed = db.Column(db.String(1))

    def __repr__(self):
        return '<Task %r>' % self.id
    
    def serialize(self):
        return {"id": self.id, "taskName": self.task_content, "lastModified": self.last_modified, "completed": self.completed}

with app.app_context():
    db.create_all()

@app.route('/', methods=['GET', 'POST', 'PUT'])
def index():
    if request.method == 'POST':
        data = request.json
        print(data)
        if data[1] == "add":
            new_task = Todo()
            new_task.id = data[0]['id']
            new_task.task_content = data[0]['taskName']
            new_task.last_modified = datetime.strptime(data[0]['lastModified'], "%a, %d %b %Y %H:%M:%S %Z")
            new_task.completed = 'N'
            db.session.add(new_task)
        elif data[1] == "del":
            delete_query = db.session.query(Todo).filter(Todo.id == data[0]['id'])
            delete_query.delete()
        elif data[1] == "complete":
            task_completed = Todo.query.get(data[0]['id'])
            task_completed.completed = 'Y'
        elif data[1] == "incomplete":
            task_incomplete = Todo.query.get(data[0]['id'])
            task_incomplete.completed = 'N'
        db.session.commit()
        tasks = Todo.query.all()
        for task in tasks:
            print(task.id, task.task_content, task.last_modified, task.completed)
        return 'success'
    
    elif request.method == 'PUT':
        data = request.json
        task_edited = Todo.query.get(data[0]['id'])
        task_edited.task_content = data[0]['taskName']
        task_edited.last_modified = datetime.strptime(data[0]['lastModified'], "%a, %d %b %Y %H:%M:%S %Z")
        db.session.commit()
        tasks = Todo.query.all()
        for task in tasks:
            print(task.id, task.task_content, task.last_modified, task.completed)
        return 'success'
    
    else:
        tasksLastSaved = []
        tasks = Todo.query.all()
        maxId = 0
        for task in tasks:
            maxId = max(maxId, task.id)
            tasksLastSaved.append(task.serialize())
        maxIdDict = {"maxId" : maxId}
        tasksLastSaved.append(maxIdDict)
        return jsonify(tasksLastSaved)
        # tasks = Todo.query.all()
        # for task in tasks:
        #     db.session.delete(task)
        #     db.session.commit()
        # print(tasks)
        # return 'success deleting'

if __name__ == '__main__':
    app.run(debug=True)