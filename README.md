# JavaScript-Funktion createUserStates()

Mit diesem Script bzw. dieser Funktion können States (Datenpunkte) unter `0_userdata.0` oder unter `javascript.x` angelegt werden. 
Dabei können mehrere States gleichzeitig angelegt werden. Sobald alle erfolgreich angelegt wurden, kann danach (per `callback`) ein beliebiger Code ausgeführt werden, also beispielsweise die Haupt-Funktion des Scripts.

Hier ist die Funktion: **[Funktion createUserStates()](https://github.com/Mic-M/iobroker.createUserStates/blob/master/createUserStates.js)**

### Warum sollte ich diese Funktion verwenden?
ioBroker promoted seit Herbst 2019, dass States (Datenpunkte) zentral unterhalb von `0_userdata.0` in der Objektstruktur abgelegt werden sollen. Siehe u.a. hier im Forum: [0_userdata.0 - Müssen eigene Daten dort liegen?](https://forum.iobroker.net/topic/26389/0_userdata-0-m%C3%BCssen-eigene-daten-dort-liegen)

`createUserStates()` ermöglicht es, Datenpunkte unterhalb von `0_userdata.0` anzulegen, was derzeit "out of the box" durch den [JavaScript-Adapter](https://github.com/ioBroker/ioBroker.javascript) noch nicht funktioniert.

Ebenso können damit gleichzeitig auch States weiterhin unterhalb `javascript.x` angelegt werden, dabei kann man ebenso wie bei der Anlage unter `0_userdata.0` die Callback-Option nutzen, damit das weitere Script erst dann ausgeführt wird, wenn alle Datenpunkte angelegt wurden bzw. existieren.


### Aufruf
`createUserStates(where, force, statesToCreate, callback)`

### Parameter

##### 1. `where`
Wo sollen die States erstellt werden? Möglich ist: `0_userdata.0` oder `javascript.x` (also `javascript.0`, `javascript.1`, usw.)

##### 2. `force` 
Wenn auf `true` gesetzt, dann werden die States neu erstellt und deren bestehenden Werte alle überschrieben.

##### 3. `statesToCreate`
Ein Array, das die zu erstellenden Datenpunkte enthält. Siehe unten die Beispiele. Der erste Parameter ist der Name des zu erstellenden States, der 2. Parameter in geschweiften Klammern "{" und "}" sind die Eigenschaften des States ("common description" genannt), siehe [Attributes for specific object types: state](https://github.com/ioBroker/ioBroker/blob/master/doc/SCHEMA.md#state). 
```
let statesToCreate = [
    ['Test.Test1', {'name':'Test 1', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
    ['Test.Test2', {'name':'Test 2', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
    ['Test.Test3', {'name':'Test 3', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
];
```

##### 4. `callback`
Optional: Hier kann man eine Funktion referenzieren, die ausgeführt wird, sobald alle States erstellt wurden.
Beispiel:
```
createUserStates('0_userdata.0', false, statesToCreate, function(){
    log('Jetzt sind alle States abgearbeitet und wir können nun fortfahren, z.B. nächste Funktion main() aufrufen.');
    // Hier weiterer Code...
});
```


### Beispiel

```
let statesToCreate = [
    ['Test.Test1', {'name':'Test 1', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
    ['Test.Test2', {'name':'Test 2', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
    ['Test.Test3', {'name':'Test 3', 'type':'string', 'read':true, 'write':true, 'role':'info', 'def':'Hello' }],
];
createUserStates('0_userdata.0', false, statesToCreate, function(){
    log('Jetzt sind alle States abgearbeitet und wir können nun fortfahren, z.B. nächste Funktion main() aufrufen.');
    main();
});

function main() {
    // Hier dann alles weitere.
    log('Nun sind wir in der main()-Funktion.')

    // Hier der weitere Code...
    
};
```

