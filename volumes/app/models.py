from app import app, db

class Categories(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), default='', nullable=False, unique=True)
    quizzes = db.relationship('Quizzes', backref='category', lazy=True)

class Quizzes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), default='', nullable=False, unique=True)
    qpath = db.Column(db.String(255), default='', nullable=False)
    url = db.Column(db.String(255), default='', nullable=False)
    qdata = db.Column(db.String(), default='', nullable=False, unique=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), default='', nullable=False)
    surname = db.Column(db.String(255), default='', nullable=False)
    username = db.Column(db.String(255), default='', nullable=False)

class Scores(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'))
  

with app.app_context():
    db.create_all()