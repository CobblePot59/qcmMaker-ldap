from flask import render_template, request, redirect, url_for, session, flash, abort, send_from_directory, jsonify
from app import app, ldap, db, hashids
from models import Categories, Quizzes, Users, Scores
from decor import login_required
import os
import json

@app.route('/', methods=['GET', 'POST'])
@login_required
def index():
    if request.method == 'GET':
        categories = [category.name for category in Categories.query.all()]
        return render_template('index.html', categories = categories)
    
    category_name = request.form['category']
    if Categories.query.filter_by(name=category_name).first():
        flash('Category already exist', 'error')
        return redirect(url_for('index'))

    new_category = Categories(name=category_name)
    db.session.add(new_category)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/by_category/<category_name>', methods=['GET'])
@login_required
def quizzes_by_category(category_name):
    category = Categories.query.filter_by(name=category_name).first()
    if category == None:
        abort(404)
    quiz_names = [quiz.name for quiz in category.quizzes]
    return render_template('quizzes_by_category.html', category = category_name, quizzes = quiz_names)

@app.route('/maker/<category_name>', methods=['GET', 'POST'])
@login_required
def maker(category_name):
    category = Categories.query.filter_by(name=category_name).first()
    if request.method == 'GET':
        if category == None:
            abort(404)
        else:
            return render_template('maker.html')

    quiz_name = request.form['quiz-name']
    quiz_name = f'{quiz_name}.html'
    if Quizzes.query.filter_by(name=quiz_name).first():
        flash(f'{quiz_name} already exist', 'error')
        return redirect(url_for('maker', category=category_name))

    quiz_path = 'quiz/'
    htmlContent = request.form['quiz-html-data']
    quiz_data = request.form['quiz-json-data']

    with open(quiz_path+quiz_name, 'w') as html_file:
        html_file.write(htmlContent)

    quiz = Quizzes(name=quiz_name, qpath=quiz_path, qdata=quiz_data, category_id=category.id)
    db.session.add(quiz)
    db.session.commit()

    hid =  hashids.encode(quiz.id)
    quiz_url = Quizzes.query.filter_by(id = quiz.id).first()
    quiz_url.url = os.getenv('URL')+hid
    db.session.commit()

    flash(f'{quiz_name} has been created', 'success')
    return redirect(url_for('quizzes_by_category', category_name=category_name))

@app.route('/<hid>', methods=['GET', 'POST'])
def url_redirect(hid):
    original_id = hashids.decode(hid)
    if original_id:
        original_id = original_id[0]
        if request.method == 'POST':
       

            name = request.form['name'].lower().strip()
            surname = request.form['surname'].lower().strip()
            username = f'{name[0]}{surname}'

            user = Users.query.filter_by(username=username).first()

            if not user:
                user = Users(name=name, surname=surname, username=username)
                db.session.add(user)
                db.session.commit()

            existing_score = Scores.query.filter_by(user_id=user.id, quiz_id=original_id).first()
            if existing_score:
                abort(401)

            quiz = Quizzes.query.filter_by(id=original_id).first()
            return send_from_directory(quiz.qpath, quiz.name, as_attachment=False)
        
        return render_template('who.html')
    else:
        abort(404)
    
@app.route('/compare_answers', methods=['POST'])
def compare_answers():
    score = 0
    results = []

    name = request.json['name']
    surname = request.json['surname']
    username = f'{name[0]}{surname}'
    url = request.json['quizUrl']
    user = Users.query.filter_by(username=username).first()

    quiz = Quizzes.query.filter_by(url = url).first()
    quiz_data = json.loads(quiz.qdata)
    user_answers = request.json['userAnswers']

    for user_question, quiz_question in zip(user_answers['questions'], quiz_data['questions']):
        user_answer = [answer['answer'] for answer in user_question['answers']]
        correct_answer = [answer['answer'] for answer in quiz_question['answers'] if answer['isCorrect']]

        if user_answer == correct_answer:
            score += 1
            result = {'question': quiz_question['question'], 'status': 'correct', 'correct_answer': correct_answer, 'user_answer': user_answer}
        else:
            result = {'question': quiz_question['question'], 'status': 'incorrect', 'correct_answer': correct_answer, 'user_answer': user_answer}
        results.append(result)

    existing_score = Scores.query.filter_by(user_id=user.id, quiz_id=quiz.id).first()
    if existing_score:
        abort(401)

    score_entry = Scores(score=score, user_id=user.id, quiz_id=quiz.id)
    db.session.add(score_entry)
    db.session.commit()

    return {"score": score, "results": results}

@app.route('/categories', methods=['GET'])
@login_required
def get_categories():
    categories = Categories.query.all()
    jcategories = [{'name': category.name, 'quizzes': [quiz.name for quiz in category.quizzes]} for category in categories]
    return jsonify(jcategories), 200

@app.route('/category/<category_name>', methods=['GET'])
@login_required
def get_category(category_name):
    category = Categories.query.filter_by(name = category_name).first()
    jcategory = {'name': category.name, 'quizzes': [quiz.name for quiz in category.quizzes]}
    return jsonify(jcategory), 200

@app.route('/category/<category_name>', methods=['POST'])
@login_required
def add_category(category_name):
    new_category = Categories(name=category_name)
    db.session.add(new_category)
    db.session.commit()
    return jsonify({'message': 'Successfully added'}), 200

@app.route('/category/<category_name>', methods=['PUT'])
@login_required
def update_category(category_name):
    category = Categories.query.filter_by(name = category_name).first()
    new_category_name = request.form['category_name']
    category.name = new_category_name
    db.session.commit()
    return jsonify({'message': 'Successfully updated'}), 200

@app.route('/category/<category_name>', methods=['DELETE'])
@login_required
def delete_category(category_name):
    Categories.query.filter_by(name = category_name).delete()
    db.session.commit()
    return jsonify({'message': 'Successfully deleted'}), 200

@app.route('/quizzes', methods=['GET'])
@login_required
def get_quizzes():
    quizzes = Quizzes.query.all()
    jquizzes = [{'name': quiz.name, 'url': quiz.url, 'qpath': quiz.qpath, 'qdata': quiz.qdata} for quiz in quizzes]
    return jsonify(jquizzes), 200

@app.route('/quiz/<quiz_name>', methods=['GET'])
@login_required
def get_quiz(quiz_name):
    quiz = Quizzes.query.filter_by(name = quiz_name).first()
    jquiz = {'name': quiz.name, 'url': quiz.url, 'qpath': quiz.qpath, 'qdata': quiz.qdata}
    return jsonify(jquiz), 200

@app.route('/quiz/<quiz_name>', methods=['DELETE'])
@login_required
def delete_quizz(quiz_name):
    Quizzes.query.filter_by(name = quiz_name).delete()
    db.session.commit()
    os.remove(f'quiz/{quiz_name}')
    return jsonify({'message': 'Successfully deleted'}), 200

@app.route('/users', methods=['GET'])
@login_required
def get_users():
    users = Users.query.all()
    users_list = [{'id': user.id, 'name': user.name, 'surname': user.surname, 'username': user.username} for user in users]
    return jsonify(users_list)

@app.route('/scores', methods=['GET'])
@login_required
def get_scores():
    scores = db.session.query(Scores.score, Users.name, Users.surname, Quizzes.name)\
        .join(Quizzes, Scores.quiz_id == Quizzes.id)\
        .join(Users, Scores.user_id == Users.id)\
        .all()
    result = [{'score': score, 'user_name': f'{name} {surname}', 'quiz_name': quiz_name} for score, name, surname, quiz_name in scores]
    return jsonify(result)

@app.route('/user-scores/<username>', methods=['GET'])
@login_required
def get_user_scores(username):
    scores = db.session.query(Scores.score, Quizzes.name)\
        .join(Quizzes, Scores.quiz_id == Quizzes.id)\
        .join(Users, Scores.user_id == Users.id)\
        .filter(Users.username == username)\
        .all()
    score_list = [{'score': score, 'quiz_name': name} for score, name in scores]
    return jsonify(score_list)

@app.route('/quiz-scores/<quiz_name>', methods=['GET'])
@login_required
def get_quiz_scores(quiz_name):
    scores = db.session.query(Scores.score, Users.name, Users.surname)\
        .join(Quizzes, Scores.quiz_id == Quizzes.id)\
        .join(Users, Scores.user_id == Users.id)\
        .filter(Quizzes.name == quiz_name)\
        .all()
    score_list = [{'score': score, 'user_name': f'{name} {surname}'} for score, name, surname in scores]
    return jsonify(score_list)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('status'):
        return redirect(url_for('index'))

    if request.method == 'GET':
       return render_template('login.html')

    login = request.form['login']
    password = request.form['password']
    if str(ldap.authenticate(login+'@'+app.config['LDAP_DOMAIN'], password).status) == 'AuthenticationResponseStatus.success':
        session.update({'status':True, 'login':login})
        return redirect(url_for('index'))
    else:
        flash('Bad Login', 'error')
        return redirect(url_for('login'))

@app.route("/logout", methods=['GET'])
def logout():
    session.clear()
    return redirect(url_for('login'))