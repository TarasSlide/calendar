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

            var currDate = new Date().toJSON().slice(0,10).split('-')[2];

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
                    number.appendChild(item);
                }
            }

            return td
        }

        addEventListener(document, 'click', function (e) {
            var td = e.target;
            if (!(e.target.className == 'day-wrap')) {
                return;
            }
            console.log(td.getAttribute('data-has-event') == 'true');
            var body = document.querySelector('body');
            if (body.getAttribute('data-open-add-event') == 'true' || td.getAttribute('data-has-event') == 'true') {
                console.log('return');
                return;
            }
            appendHtml(td, `
                <div class="add-event">
                    <h3 class="task-title">Task</h3>
                    <button type="button" class="close">&times;</button>
                    <input type="text" class="event-date" value="${td.getAttribute('data-date')}">
                    <input type="text" class="event-name-input">
                    <button type="button" class="create-event-btn primary-btn">Create</button>
                </div>
            `);
            body.setAttribute('data-open-add-event', 'true');
        });

        addEventListener(document, 'click', function (e) {
            if (!(e.target.className.indexOf("create-event-btn") !== -1)) {
                return;
            }
            var addEventElements = e.target.parentNode.childNodes;
            var addEventNameInput = null;
            var eventDate = null;
            addEventElements.forEach(function (item, i) {
                if (item.className == "event-name-input") {
                    addEventNameInput = item.value;
                }
                if (item.className == "event-date") {
                    eventDate = item.value;
                }
            });

            if (addEventNameInput && eventDate) {
                events.push({
                    date:  eventDate,
                    eventName: addEventNameInput
                });

                document.getElementById("calendar").removeChild(document.querySelector('.calendar'));
                calendar = buildTable(date.getFullYear(), date.getMonth());
                container.appendChild(calendar);
                document.querySelector('body').setAttribute('data-open-add-event', 'false');
            }
        });

        addEventListener(document, 'click', function (e) {
            if (!(e.target.className.indexOf("close") !== -1)) {
                return;
            }
            document.querySelector('.add-event').remove();
            document.querySelector('body').setAttribute('data-open-add-event', 'false');

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
        date: `${thisYear}-05-15`,
        eventName: 'first event',
        note: 'note 1'
    },
    {
        date: `${thisYear}-05-16`,
        eventName: 'second event',
        note: 'note 3'
    }
];

calendar('#calendar', events);