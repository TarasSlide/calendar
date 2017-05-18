;(function () {
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
                    td.setAttribute('data-has-event', 'true');
                    var item = newElement('span');
                    item.innerHTML = data[i].eventName;
                    item.className = 'calendar-item';
                    number.appendChild(item);
                }
            }

            return td
        }

        addEventListener(document, 'click', function (e) {
            let td = e.target;
            console.log(e.target.parentNode);
            if (!(e.target.className == 'day')) {
                return;
            }
            console.log(td);
            if (td.getAttribute('data-open-add-event')) return;
            let hasEvent = td.getAttribute('data-has-event');
            td.setAttribute('data-open-add-event', 'true');
            if (hasEvent) {
                appendHtml(td, `
                        <div class="add-event">
                            <input type="text" class="event-date" value="${td.getAttribute('data-date')}">
                            <input type="text" class="event-name-input">
                            <button type="button" class="create-event-btn">Create</button>
                        </div>
                    `)
            }
        });

        addEventListener(document, 'click', function (e) {
            if (!(e.target.className == 'create-event-btn')) {
                return;
            }
            var addEventElements = e.target.parentNode.childNodes;
            var addEventNameInput = null;
            var eventDate = null;
            addEventElements.forEach(function (item, i) {
                console.log(item);
                if (item.className == "event-name-input") {
                    console.log(item);
                    addEventNameInput = item.value;
                }
                if (item.className == "event-date") {
                    eventDate = item.value;
                }
            });
            console.log(addEventNameInput);

            if (addEventNameInput && eventDate) {
                console.log(addEventNameInput);
                console.log(eventDate);
                events.push({
                    date:  eventDate,
                    eventName: addEventNameInput
                });
            }
            console.log(events);
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
        eventName: 'first event'
    },
    {
        date: `${thisYear}-05-15`,
        eventName: 'first event'
    },
    {
        date: `${thisYear}-05-16`,
        eventName: 'second event'
    }
];

calendar('#calendar', events);