let idIncrementer, numOfCompTasks, arrOfTaskObjs, taskId, arrOfCompletedTasks;
const URL = "http://127.0.0.1:5000/";

idIncrementer = 0;
numOfCompTasks = 0;
arrOfTaskObjs = [];
taskId = 0;
arrOfCompletedTasks = [];

window.onload = function getData() {
    fetch(URL)
    .then(response => { return response.json(); })
    .then(data => { processBackendData(data); })
    .catch(error => { console.error("Error fetching data", error); });
}

function processBackendData(res) {
    idIncrementer = res[res.length - 1]["maxId"] + 1;
    for (let t = 0; t < res.length - 1; t++) {
        if (res[t]["completed"] === 'N') {
            handleTodoAdd(undefined, undefined, undefined, res[t]);
        }
        else {
            chkboxTickEffect(res[t]);
        }
    }
}

function handleTodoAdd(txtVal, divId, incId, taskDB) {

    let chkbox = document.createElement("input");
    let txtbox = document.createElement("input");
    let editBtn = document.createElement("button");
    let delBtn = document.createElement("button");
    let lstModLabel = document.createElement("label");

    editBtn.style.backgroundImage="url('C:/Users/mshah64/Desktop/to-do/icon/edit.png')";
    editBtn.style.height = '25px';
    editBtn.style.width = '25px';
    delBtn.style.backgroundImage="url('C:/Users/mshah64/Desktop/to-do/icon/trash.png')";
    delBtn.style.height = '25px';
    delBtn.style.width = '25px';
    
    if (!txtVal && !taskDB) {
        idIncrementer += 1;
        for (let btn in document.getElementsByClassName("actionBtn")) {
            document.getElementsByClassName("actionBtn")[btn].disabled = true;
        }
    }

    chkbox.type = "checkbox";
    chkbox.id = "chk" + idIncrementer;
    chkbox.className = "actionBtn";
    chkbox.addEventListener("change", chkboxTickEffect);
    chkbox.db_param = 'None';

    txtbox.setAttribute("type", "text");
    txtbox.setAttribute("placeholder", "To-do task");
    txtbox.id = "txt" + idIncrementer;
    txtbox.addEventListener("keyup", textboxDisable);
    
    if (txtVal) {
        for (let i in arrOfCompletedTasks) {
            if (arrOfCompletedTasks[i].taskName === txtVal) {
                var lastModNew = (new Date()).toUTCString();
                sendData(arrOfCompletedTasks[i], "incomplete", 'POST');
                arrOfTaskObjs.push(arrOfCompletedTasks[i]);
                arrOfTaskObjs[arrOfTaskObjs.length - 1].lastModified = lastModNew;
                arrOfCompletedTasks.splice(i, 1);
                break;
            }
        }
        txtbox.setAttribute("value", txtVal);
        txtbox.disabled = true;
        document.getElementById(divId).remove();
        numOfCompTasks -= 1;
        document.getElementById("tasksCompNum").innerHTML = numOfCompTasks;
    }

    editBtn.id = "edt" + idIncrementer;
    editBtn.className = "actionBtn edtBtn";
    editBtn.addEventListener("click", editFunc);

    delBtn.id = "del" + idIncrementer;
    delBtn.className = "actionBtn delBtn";
    delBtn.addEventListener("click", handleTodoDelete);

    lstModLabel.id = "lml" + idIncrementer;

    flexItem = document.createElement("div");
    flexItem.id = "flx" + idIncrementer;

    if (txtVal) {
        flexItem.id = "flx" + incId.slice(3);
        delBtn.id = "del" + incId.slice(3);
        editBtn.id = "edt" + incId.slice(3);
        txtbox.id = "txt" + incId.slice(3);
        chkbox.id = "chk" + incId.slice(3);
        lstModLabel.id = "lml" + incId.slice(3);
        lstModLabel.innerHTML = lastModNew;
    }

    if (taskDB) {
        flexItem.id = "flx" + taskDB["id"];
        delBtn.id = "del" + taskDB["id"];
        editBtn.id = "edt" + taskDB["id"];
        txtbox.id = "txt" + taskDB["id"];
        chkbox.id = "chk" + taskDB["id"];
        lstModLabel.id = "lml" + taskDB["id"];
        lstModLabel.innerHTML = taskDB["lastModified"];
        txtbox.setAttribute("value", taskDB["taskName"]);
        txtbox.disabled = true;
        delete taskDB["completed"];
        arrOfTaskObjs.push(taskDB);
    }

    flexItem.appendChild(chkbox);
    flexItem.appendChild(txtbox);
    flexItem.appendChild(editBtn);
    flexItem.appendChild(delBtn);
    flexItem.appendChild(lstModLabel);
    document.getElementById("flexBox").prepend(flexItem);

    if (!txtVal && !taskDB) {
        chkbox.disabled = true;
        editBtn.disabled = true;
        txtbox.focus();
        document.getElementById("addTaskBtn").disabled = true;
    }
}

function handleTodoDelete() {
    for (let i in arrOfTaskObjs) {
        if (arrOfTaskObjs[i].id === +this.id.slice(3) ) {
            sendData(arrOfTaskObjs[i], "del", 'POST');
            arrOfTaskObjs.splice(i, 1);
            break;
        }
    }
    document.getElementById("flx" + this.id.slice(3)).remove();
    document.getElementById("addTaskBtn").disabled = false;
}

function textboxDisable(event) {
    let taskBox = document.getElementById(this.id);
    
    if (event.key === "Enter" && taskBox.value.trim().length > 0) {
        taskId += 1;
        let taskObjDict = {};
        taskObjDict["id"] = taskId;
        taskObjDict["taskName"] = taskBox.value;
        let taskTime = (new Date()).toUTCString();
        taskObjDict["lastModified"] = taskTime;
        let flag = false;
        let uneditedFlag = false;
        
        for (let it in arrOfTaskObjs) {
            if (arrOfTaskObjs[it].id.toString() === this.id.slice(3)) {
                if (arrOfTaskObjs[it].taskName === taskBox.value) {
                    uneditedFlag = true;
                }
                else {
                    arrOfTaskObjs[it].taskName = taskBox.value;
                    arrOfTaskObjs[it].lastModified = taskTime;
                    sendData(arrOfTaskObjs[it], "edit", 'PUT');
                }
                flag = true;
                taskId -= 1;
                break;
            }
        }
        if (flag === false) {
            sendData(taskObjDict, "add", 'POST');
            arrOfTaskObjs.push(taskObjDict);
        }

        taskBox.disabled = true;
        
        if (!uneditedFlag) {
            let firstFlexTodo = document.getElementById("flexBox").firstChild;
            document.getElementById("flexBox").insertBefore(document.getElementById("flx" + this.id.slice(3)), firstFlexTodo);
            document.getElementById("lml" + this.id.slice(3)).innerHTML = taskTime;
        }
        document.getElementById("addTaskBtn").disabled = false;
    
        for (let btn in document.getElementsByClassName("actionBtn")) {
            document.getElementsByClassName("actionBtn")[btn].disabled = false;
        }
    }
}

function editFunc() {
    for (let btn in document.getElementsByClassName("actionBtn")) {
        document.getElementsByClassName("actionBtn")[btn].disabled = true;
    }
    document.getElementById("txt" + this.id.slice(3)).disabled = false;
    document.getElementById("del" + this.id.slice(3)).disabled = false;
    document.getElementById("addTaskBtn").disabled = true;
    let end = document.getElementById("txt" + this.id.slice(3)).value.length;
    document.getElementById("txt" + this.id.slice(3)).setSelectionRange(end, end);
    document.getElementById("txt" + this.id.slice(3)).focus();
}

function chkboxTickEffect(taskDB) {
    if (this.db_param != undefined && this.db_param != null) {
        taskDB=this.db_param;
    }

    numOfCompTasks += 1;
    document.getElementById("tasksCompNum").innerHTML = numOfCompTasks;

    if (taskDB === 'None') {
        for (let i in arrOfTaskObjs) {
            if (arrOfTaskObjs[i].id === +this.id.slice(3)) {
                sendData(arrOfTaskObjs[i], "complete", 'POST');
                arrOfCompletedTasks.push(arrOfTaskObjs[i]);
                arrOfTaskObjs.splice(i, 1);
                break;
            }
        }
    }
    else {
        delete taskDB["completed"];
        arrOfCompletedTasks.push(taskDB);
    }

    let myDiv = document.createElement("div");
    myDiv.id = "div" + numOfCompTasks;

    let insideTxt;
    if (taskDB === 'None') {
        insideTxt = document.getElementById("txt" + this.id.slice(3)).value;
    }
    else {
        insideTxt = taskDB["taskName"];
    }
    let txtboxVal = document.createTextNode(insideTxt);

    let span = document.createElement("span");
    span.innerHTML = "&emsp;";

    let incompleteBtn = document.createElement("button");
    incompleteBtn.innerHTML = "Mark as Incomplete";
    if (taskDB === 'None') {
        incompleteBtn.id = "inc" + this.id.slice(3);
    }
    else {
        incompleteBtn.id = "inc" + taskDB["id"];
    }
    incompleteBtn.addEventListener("click", function () { handleTodoAdd(insideTxt, myDiv.id, incompleteBtn.id, undefined) ;});

    myDiv.appendChild(document.createTextNode(numOfCompTasks + ". "));
    myDiv.appendChild(txtboxVal);
    myDiv.appendChild(span);
    myDiv.appendChild(incompleteBtn);
    document.getElementById("compTasks").appendChild(myDiv);
    
    if (taskDB === 'None') {
        document.getElementById("flx" + this.id.slice(3)).remove();
    }
}

function sendData(taskDict, action, methodType){
    fetch(URL, {
        method: methodType,
        body: JSON.stringify([taskDict, action]),
        headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        }
    })
}