var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
    clients: {},
    reset: function () {
        this.clients = {}
    },
    addAppointment: function (name, date) {
        if (this.clients[name]) {
            this.clients[name].push(date)
            var n = this.clients[name].indexOf(date)
            this.clients[name][n].status = "pending"
        }
        else {
            this.clients[name] = [date]
            this.clients[name][0].status = "pending"
        }
    },
    attend: function (name, date) {
        if (this.clients[name]) {
            var found = this.clients[name].find(el => el.date === date)
            if (found) {
                var n = this.clients[name].indexOf(found)
                this.clients[name][n].status = "attended"
            }
        }
    },
    expire: function (name, date) {
        if (this.clients[name]) {
            var found = this.clients[name].find(el => el.date === date)
            if (found) {
                var n = this.clients[name].indexOf(found)
                this.clients[name][n].status = "expired"
            }
        }
    },
    cancel: function (name, date) {
        if (this.clients[name]) {
            var found = this.clients[name].find(el => el.date === date)
            if (found) {
                var n = this.clients[name].indexOf(found)
                this.clients[name][n].status = "cancelled"
            }
        }
    },
    erase: function (name, borrar) {
        if (this.clients[name]) {
            if (borrar !== "cancelled" || borrar !== "attended" | borrar !== "expired") {
                var found = this.clients[name].find(el => el.date === borrar)
                var fecha = true
            }
            else {
                var found = this.clients[name].find(el => el.status === status)
                var fecha = false
            }
            if (found && fecha) {
                this.clients[name] = this.clients[name].filter(x => x.date !== borrar)
            }
            else {
                this.clients[name] = this.clients[name].filter(x => x.status !== borrar)
            }
        }
    },
    getAppointments: function (name, status) {
        if (!status) {
            return this.clients[name]
        }
        else {
            var filtrados = []
            filtrados = this.clients[name].filter(x => x.status === status)
            return filtrados
        }
    },
    getClients: function () {
        var clientes = Object.keys(this.clients)
        return clientes
    },

};

server.use(bodyParser.json());

server.get('/api', (req, res) => {
    res.json(model.clients)
})

server.post('/api/Appointments', (req, res) => {
    if (!req.body.client) {
        res.status(400)
        res.send('the body must have a client property')
    }
    else if (typeof req.body.client !== "string") {
        res.status(400)
        res.send('client must be a string')
    }
    else {
        model.addAppointment(req.body.client, req.body.appointment)
        res.json(model.getAppointments(req.body.client, req.body.date)[0])
    }
})

server.get('/api/Appointments/:name', (req, res) => {
    if (req.params.name === "clients") {
        res.json(model.getClients())
    }
    else {
        var cliente = model.getAppointments(req.params.name)

        if (!cliente) {
            res.status(400)
            return res.send('the client does not exist')
        }
        var found = cliente.find(el => el.date === req.query.date)
        if (!found) {
            res.status(400)
            return res.send('the client does not have a appointment for that date')
        }
        if (req.query.option) {
            if (req.query.option !== "attend" && req.query.option !== "cancel" && req.query.option !== "expire") {
                res.status(400)
                return res.send('the option must be attend, expire or cancel')
            }
            else {
                model[req.query.option](req.params.name, req.query.date)
                var turnos = model.getAppointments(req.params.name).filter(x => x.date === req.query.date)
                res.send(turnos[0])
            }

        }
    }
})

server.get('/api/Appointments/:name/erase', (req, res) => {
    var cliente = model.getAppointments(req.params.name)
    if (!cliente) {
        res.status(400)
        return res.send('the client does not exist')
    }
    // var found = cliente.find(el => el.date === req.query.date)
    if (req.query.date === "expired" || req.query.date === "cancelled" || req.query.date === "attended") {
        var eliminados = model.clients[req.params.name].filter(x => x.status === req.query.date)
        model.clients[req.params.name] = model.clients[req.params.name].filter(x => x.status !== req.query.date)
        res.send(eliminados)
    }
    else {
        var eliminados = model.clients[req.params.name].filter(x => x.date === req.query.date)
        model.clients[req.params.name] = model.clients[req.params.name].filter(x => x.date !== req.query.date)
        res.send(eliminados)
    }
})

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
    var cliente = model.getAppointments(req.params.name)
    if (!cliente) {
        res.status(400)
        return res.send('the client does not exist')
    }
    var filtrados = model.clients[req.params.name].filter(x => x.status === req.query.status)
    res.send(filtrados)
})



server.listen(3000);
module.exports = { model, server };
