;(function () {
    document.querySelector('body').setAttribute('data-open-add-event', 'false')
    function Calendar(target, date, data) {
        var date;
        var calendar;
        var container;

        switch (typeof date) {
            case 'string':
                date = date.split('-');
                date = new Date(date[0], parseInt(date[1], 10) - 1, date[2]);
                break;
            case 'undefined':
                date = new Date();
                break;
            case 'object':
                if (date instanceof Array) {
                    data = date;
                    date = new Date()
                } else {
                    date = date;
                }
                break;
            default:
                throw 'Invalid date type!'
        }

        container = document.querySelector(target);
        calendar = buildTable(date.getFullYear(), date.getMonth());
        container.appendChild(calendar);

        function buildTable(year, month) {

            var controlDate = new Date(year, month + 1, 0);
            var currDate = new Date(year, month, 1);
            var iter = 0;
            var ready = true;

            var table = newElement('table');
            var thead = newElement('thead');
            var tbody = newElement('tbody');
            var tr;

            if (currDate.getDay() !== 0) {
                iter = 0 - currDate.getDay()
            }

            while (ready) {

                if (currDate.getDay() === 6) {
                    if (tr) {
                        tbody.appendChild(tr)
                    }
                    tr = null
                }

                if (!tr) {
                    tr = newElement('tr')
                }

                currDate = new Date(year, month, ++iter);

                tr.appendChild(newDayCell(currDate, iter < 1 || +currDate > +controlDate));

                if (+controlDate < +currDate && currDate.getDay() === 0) {
                    ready = false
                }

            }

            thead.innerHTML = '<tr>' +
                '<th class="day day-head-wrap"><span class="head">Sun</span></th>' +
                '<th class="day day-head-wrap"><span class="head">Mon</span></th>' +
                '<th class="day day-head-wrap"><span class="head">Tue</span></th>' +
                '<th class="day day-head-wrap"><span class="head">Wed</span></th>' +
                '<th class="day day-head-wrap"><span class="head">Thu</span></th>' +
                '<th class="day day-head-wrap"><span class="head">Fri</span></th>' +
                '<th class="day day-head-wrap"><span class="head">Sat</span></th>' +
                '</tr>';

            table.appendChild(thead);
            table.appendChild(tbody);

            table.className = 'calendar';
            table.setAttribute('cellspacing', 0);
            table.setAttribute('cellpadding', 0);
            table.setAttribute('data-period', year + '-' + (month));

            return table
        }

        function newDayCell(dateObj, isOffset) {

            var td = newElement('td');
            var number = newElement('span');
            var isoDate = dateObj.toISOString();

            isoDate = isoDate.slice(0, isoDate.indexOf('T'));
            number.innerHTML = dateObj.getDate();
            number.className = 'day-wrap';
            number.setAttribute('data-date', isoDate);

            var currDate = new Date().toJSON().slice(0, 10).split('-')[2];

            if (dateObj.getDate() == currDate) {
                td.className = 'current-day ';
            }

            td.className += isOffset ? 'day adj-month' : 'day';
            td.setAttribute('data-date', isoDate);
            td.setAttribute('data-has-event', 'false');
            td.appendChild(number);

            for (var i = 0; i < data.length; i++) {

                if (data[i].date === isoDate) {
                    number.setAttribute('data-has-event', 'true');
                    var item = newElement('span');
                    item.innerHTML = data[i].eventName;
                    item.className = 'calendar-item';
                    item.setAttribute('data-id', data[i].id);
                    number.appendChild(item);
                }
            }

            return td
        }

        // show add task dialog on day click
        addEventListener(document, 'click', function (e) {

            if (!(e.target.className == 'day-wrap') || (e.target.parentNode.className.indexOf("adj-month") !== -1)) {
                return;
            }

            var td = e.target;
            var body = document.querySelector('body');

            if (body.getAttribute('data-open-add-event') == 'true' || td.getAttribute('data-has-event') == 'true') {
                console.log('return');
                return;
            }

            appendHtml(td, `
                <div class="add-event dialog">
                    <h3 class="task-title">Task</h3>
                    <button type="button" class="close close-btn">&times;</button>
                    <label>When</label>
                    <div class="event-date">${td.getAttribute('data-date')}</div>
                    <input type="text" class="event-name-input" placeholder="Task title...">
                    <label>Note</label>
                    <input type="text" class="event-note-input">
                    <button type="button" class="create-event-btn primary-btn">Create</button>
                </div>
            `);

            body.setAttribute('data-open-add-event', 'true');
        });

        // show edit dialog on event click
        addEventListener(document, 'click', function (e) {

            if (!(e.target.className == 'calendar-item')) {
                return;
            }

            var event = e.target;
            var td = event.parentNode;

            var eventData = events.filter(function (item, i) {
                return item.id == event.getAttribute('data-id');
            });

            eventData = eventData[0];

            console.log(eventData);

            appendHtml(td, `
                <div class="add-event dialog">
                    <h3 class="task-title">Task</h3>
                    <input type="text" class="event-title" value="${eventData.eventName}">
                    <input type="text" class="event-date" value="${eventData.date}">
                    <textarea rows="6" cols="48" name="note" class="note">${eventData.note}</textarea>
                    <button type="button" class="default-btn close-btn edit-btn" data-edit-event-id="${eventData.id}">Close</button>
                    <button type="button" class="primary-btn delete-event-btn" data-edit-event-id="${eventData.id}">Delete</button>
                </div>
            `);
        });

        // delete event
        addEventListener(document, 'click', function (e) {

            if (!(e.target.className.indexOf("delete-event-btn") !== -1)) {
                return;
            }

            var event = e.target;
            var eventId = event.getAttribute('data-edit-event-id');

            events.forEach(function (item, i) {
                console.log(item);
                console.log(eventId);
                if (item.id == eventId) {
                    events.splice(eventId - 1, 1);
                }
            });

            renderCalendar();
        });

        // create event on create btn click
        addEventListener(document, 'click', function (e) {

            if (!(e.target.className.indexOf("create-event-btn") !== -1)) {
                return;
            }

            var addEventElements = e.target.parentNode.childNodes;
            var addEventNameInput = null;
            var addEventNoteInput = null;
            var eventDate = null;

            addEventElements.forEach(function (item, i) {

                if (item.className == "event-name-input") {
                    addEventNameInput = item.value;
                }

                if (item.className == "event-note-input") {
                    addEventNoteInput = item.value ? item.value : 'no note';
                }

                if (item.className == "event-date") {
                    eventDate = item.innerHTML;
                }
            });

            if (addEventNameInput && eventDate) {

                events.push({
                    id: data.length ? data[data.length - 1].id + 1 : 1,
                    date: eventDate,
                    eventName: addEventNameInput,
                    note: addEventNoteInput
                });

                console.log(events);
                document.getElementById("calendar").removeChild(document.querySelector('.calendar'));
                calendar = buildTable(date.getFullYear(), date.getMonth());
                container.appendChild(calendar);
                document.querySelector('body').setAttribute('data-open-add-event', 'false');
            }
        });

        // render calendar
        function renderCalendar() {
            document.getElementById("calendar").removeChild(document.querySelector('.calendar'));
            calendar = buildTable(date.getFullYear(), date.getMonth());
            container.appendChild(calendar);
            document.querySelector('body').setAttribute('data-open-add-event', 'false');
        }

        // close dialog
        addEventListener(document, 'click', function (e) {

            if (!(e.target.className.indexOf("close-btn") !== -1)) {
                return;
            }

            document.querySelector('.dialog').remove();
            document.querySelector('body').setAttribute('data-open-add-event', 'false');
        });

        // save edited event data
        addEventListener(document, 'click', function (e) {

            if (!(e.target.className.indexOf("edit-btn") !== -1)) {
                return;
            }

            var event = e.target;
            var eventId = event.getAttribute('data-edit-event-id');
            var editEventElements = e.target.parentNode.childNodes;
            var editEventNameInput = null;
            var editEventNoteInput = null;
            var eventDate = null;

            editEventElements.forEach(function (item, i) {

                if (item.className == "event-title") {
                    editEventNameInput = item.value;
                }

                if (item.className == "note") {
                    editEventNoteInput = item.value ? item.value : 'no note';
                }

                if (item.className == "event-date") {
                    eventDate = item.value;
                    console.log(eventDate);
                }
            });

            if (editEventNameInput && eventDate) {
                events.forEach(function (item, i) {

                    if (item.id == eventId) {
                        console.log(item);
                        events[i] = {
                            id: item.id,
                            date: eventDate,
                            eventName: editEventNameInput,
                            note: editEventNoteInput
                        };
                    }
                });

                console.log(events);
                document.getElementById("calendar").removeChild(document.querySelector('.calendar'));
                calendar = buildTable(date.getFullYear(), date.getMonth());
                container.appendChild(calendar);
                document.querySelector('body').setAttribute('data-open-add-event', 'false');
            }

        });

        function newElement(tagName) {
            return document.createElement(tagName)
        }

        function addEventListener(target, event, handler) {

            if (document.addEventListener) {
                target.addEventListener(event, handler, false)
            } else {
                target.attachEvent('on' + event, handler)
            }
        }

        function removeEventListener(target, event, handler) {

            if (document.removeEventListener) {
                target.removeEventListener(event, handler, false)
            } else {
                target.detachEvent('on' + event, handler)
            }
        }

        function appendHtml(el, str) {

            var div = document.createElement('div');
            div.innerHTML = str;

            while (div.children.length > 0) {
                el.appendChild(div.children[0]);
            }
        }
    }

    this.calendar = Calendar

}).call(this);

const thisYear = new Date().getFullYear();
var events = [
    {
        id: 1,
        date: `${thisYear}-05-15`,
        eventName: 'first event',
        note: 'note 1'
    },
    {
        id: 2,
        date: `${thisYear}-05-16`,
        eventName: 'second event',
        note: 'note 3'
    }
];

calendar('#calendar', events);