import Phaser from "phaser";

const gameOptions = {
    gemSize: 100,
    fallSpeed: 200,
    destroySpeed: 400,
    movementOffset: 10
}

const mathGame = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: "mathGame" });
    },
    preload: function () {
        this.load.spritesheet("gems", "/assets/sprites/gems.png", {
            frameWidth: gameOptions.gemSize,
            frameHeight: gameOptions.gemSize
        });
    },
    create: function () {
        this.match3 = new Match3({
            rows: 6,
            columns: 8,
            items: 6
        });
        this.match3.generateField();
        this.canPick = true;
        this.canDrag = false;
        this.drawField();
        this.input.on("pointerdown", this.startMoving, this);
        this.input.on("pointermove", this.keepMoving, this);
        this.input.on("pointerup", this.stopMoving, this);
        this.tempGem = this.add.sprite(0, 0, "gems");
        this.tempGem.visible = false;
        this.tempGem.setOrigin(0, 0);
    },
    update: function () { },
    drawField: function () {
        this.poolArray = [];
        for (let i = 0; i < this.match3.getRows(); i++) {
            for (let j = 0; j < this.match3.getColumns(); j++) {
                let gemX = gameOptions.gemSize * j;
                let gemY = gameOptions.gemSize * i;
                let gem = this.add.sprite(gemX, gemY, "gems", this.match3.valueAt(i, j));
                gem.setOrigin(0, 0);
                this.match3.setCustomData(i, j, gem);
            }
        }
    },
    startMoving: function (pointer) {
        console.log(pointer);
        if (this.canPick) {
            this.movingRow = false;
            this.movingCol = false;
            this.canPick = false;
            let row = Math.floor(pointer.y / gameOptions.gemSize);
            let col = Math.floor(pointer.x / gameOptions.gemSize);
            if (this.match3.validPick(row, col)) {
                this.match3.setSelectedItem(row, col)
                this.canDrag = true;
            }
            else {
                this.canPick = true;
            }
        }
    },
    keepMoving: function (pointer) {
        if (this.canDrag) {
            let vector = new Phaser.Math.Vector2(pointer.x - pointer.downX, pointer.y - pointer.downY);
            if (this.movingRow === false && this.movingCol === false) {
                if (vector.length() > gameOptions.movementOffset) {
                    let angle = vector.angle();
                    if ((angle >= Math.PI / 4 && angle <= Math.PI * 3 / 4) || (angle >= Math.PI * 5 / 4 && angle <= Math.PI * 7 / 4)) {
                        this.movingCol = this.match3.getSelectedItem().column;
                    }
                    else {
                        this.movingRow = this.match3.getSelectedItem().row;
                    }
                }
            }
            else {
                this.tempGem.visible = true;
                for (let i = 0; i < this.match3.getRows(); i++) {
                    for (let j = 0; j < this.match3.getColumns(); j++) {
                        if (i === this.movingRow) {
                            this.match3.customDataOf(i, j).x = (j * gameOptions.gemSize + vector.x) % (gameOptions.gemSize * this.match3.getColumns());
                            this.tempGem.y = this.match3.customDataOf(i, j).y;
                            let offset = Math.floor(Math.abs(vector.x) / gameOptions.gemSize);
                            if (vector.x > 0) {
                                offset = offset * -1 - 1;
                                this.tempGem.x = vector.x % gameOptions.gemSize - gameOptions.gemSize;
                            }
                            else {
                                this.tempGem.x = vector.x % gameOptions.gemSize;
                            }
                            this.tempGem.setFrame(this.match3.valueAtDelta(this.match3.getSelectedItem().row, 0, 0, offset))
                            if (this.match3.customDataOf(i, j).x < 0) {
                                this.match3.customDataOf(i, j).x += gameOptions.gemSize * this.match3.getColumns();
                            }
                        }
                        if (j === this.movingCol) {
                            this.match3.customDataOf(i, j).y = (i * gameOptions.gemSize + vector.y) % (gameOptions.gemSize * this.match3.getRows());
                            this.tempGem.x = this.match3.customDataOf(i, j).x;
                            let offset = Math.floor(Math.abs(vector.y) / gameOptions.gemSize);
                            if (vector.y > 0) {
                                offset = offset * -1 - 1;
                                this.tempGem.y = vector.y % gameOptions.gemSize - gameOptions.gemSize;
                            }
                            else {
                                this.tempGem.y = vector.y % gameOptions.gemSize;
                            }
                            this.tempGem.setFrame(this.match3.valueAtDelta(0, this.match3.getSelectedItem().column, offset, 0))
                            if (this.match3.customDataOf(i, j).y < 0) {
                                this.match3.customDataOf(i, j).y += gameOptions.gemSize * this.match3.getRows();
                            }
                        }
                    }
                }
            }
        }
    },
    stopMoving: function (pointer) {
        if (this.canDrag) {
            this.canDrag = false;
            let vector = new Phaser.Math.Vector2(pointer.upX - pointer.downX, pointer.upY - pointer.downY);
            this.gemsToMove = [];
            let movement = new Phaser.Math.Vector2(0, 0);
            if (this.movingCol !== false) {
                let offset = Math.round(vector.y / gameOptions.gemSize);
                let gemsToMove = this.match3.shiftColumnBy(this.movingCol, offset);
                gemsToMove.forEach(function (gem) {
                    if (Math.abs(this.match3.customDataOf(gem.row, gem.column).y - gem.row * gameOptions.gemSize) > gameOptions.gemSize) {
                        let temp = this.match3.customDataOf(gem.row, gem.column).y;
                        this.match3.customDataOf(gem.row, gem.column).y = this.tempGem.y;
                        this.tempGem.y = temp;
                    }
                    this.gemsToMove.push(this.match3.customDataOf(gem.row, gem.column));
                }.bind(this));
                let destination = (this.tempGem.y < 0) ? -gameOptions.gemSize : this.match3.getRows() * gameOptions.gemSize;
                movement.y = destination - this.tempGem.y;
            }
            if (this.movingRow !== false) {
                let offset = Math.round(vector.x / gameOptions.gemSize);
                let gemsToMove = this.match3.shiftRowBy(this.movingRow, offset);
                gemsToMove.forEach(function (gem) {
                    if (Math.abs(this.match3.customDataOf(gem.row, gem.column).x - gem.column * gameOptions.gemSize) > gameOptions.gemSize) {
                        let temp = this.match3.customDataOf(gem.row, gem.column).x;
                        this.match3.customDataOf(gem.row, gem.column).x = this.tempGem.x;
                        this.tempGem.x = temp;
                    }
                    this.gemsToMove.push(this.match3.customDataOf(gem.row, gem.column));
                }.bind(this));
                let destination = (this.tempGem.x < 0) ? -gameOptions.gemSize : this.match3.getColumns() * gameOptions.gemSize;
                movement.x = destination - this.tempGem.x;
            }
            this.gemsToMove.push(this.tempGem);
            this.tweens.add({
                targets: this.gemsToMove,
                props: {
                    y: {
                        value: "+=" + movement.y
                    },
                    x: {
                        value: "+=" + movement.x
                    }
                },
                duration: Math.abs(gameOptions.destroySpeed / gameOptions.gemSize * (movement.x + movement.y)),
                callbackScope: this,
                onComplete: function (event, sprite) {
                    this.tempGem.visible = false;
                    this.handleMatches();
                }
            });
        }
    },
    handleMatches: function () {
        if (this.match3.matchInBoard()) {
            let gemsToRemove = this.match3.getMatchList();
            let destroyed = 0;
            gemsToRemove.forEach(function (gem) {
                this.poolArray.push(this.match3.customDataOf(gem.row, gem.column))
                destroyed++;
                this.tweens.add({
                    targets: this.match3.customDataOf(gem.row, gem.column),
                    alpha: 0,
                    duration: gameOptions.destroySpeed,
                    callbackScope: this,
                    onComplete: function (event, sprite) {
                        destroyed--;
                        if (destroyed === 0) {
                            this.makeGemsFall();
                        }
                    }
                });
            }.bind(this));
        }
        else {
            this.canPick = true;
        }
    },
    makeGemsFall: function(){
        let moved = 0;
        this.match3.removeMatches();
        let fallingMovements = this.match3.arrangeBoardAfterMatch();
        fallingMovements.forEach(function(movement){
            moved ++;
            this.tweens.add({
                targets: this.match3.customDataOf(movement.row, movement.column),
                y: this.match3.customDataOf(movement.row, movement.column).y + movement.deltaRow * gameOptions.gemSize,
                duration: gameOptions.fallSpeed * Math.abs(movement.deltaRow),
                callbackScope: this,
                onComplete: function(){
                    moved --;
                    if(moved === 0){
                        this.endOfMove()
                    }
                }
            })
        }.bind(this));
        let replenishMovements = this.match3.replenishBoard();
        replenishMovements.forEach(function(movement){
            moved ++;
            let sprite = this.poolArray.pop();
            sprite.alpha = 1;
            sprite.y = gameOptions.gemSize * (movement.row - movement.deltaRow);
            sprite.x = gameOptions.gemSize * movement.column;
            sprite.setFrame(this.match3.valueAt(movement.row, movement.column));
            this.match3.setCustomData(movement.row, movement.column, sprite);
            this.tweens.add({
                targets: sprite,
                y: gameOptions.gemSize * movement.row,
                duration: gameOptions.fallSpeed * movement.deltaRow,
                callbackScope: this,
                onComplete: function(){
                    moved --;
                    if(moved === 0){
                        return this.endOfMove()
                    }
                }
            });
        }.bind(this))
    },
    endOfMove: function(){
        if(this.match3.matchInBoard()){
            this.time.addEvent({
                delay: 250,
                callback: this.handleMatches()
            });
        }
        else{
            this.canPick = true;
            this.selectedGem = null;
        }
    }
});

class Match3 {
    // constructor, simply turns obj information into class properties
    constructor(obj) {
        if (obj === undefined) {
            obj = {}
        }
        this.rows = (obj.rows !== undefined) ? obj.rows : 6;
        this.columns = (obj.columns !== undefined) ? obj.columns : 8;
        this.items = (obj.items !== undefined) ? obj.items : 6;
    }

    // generates the game field
    generateField() {
        this.gameArray = [];
        this.selectedItem = false;
        for (let i = 0; i < this.rows; i++) {
            this.gameArray[i] = [];
            for (let j = 0; j < this.columns; j++) {
                do {
                    let randomValue = Math.floor(Math.random() * this.items);
                    this.gameArray[i][j] = {
                        value: randomValue,
                        isLocked: false,
                        isEmpty: false,
                        row: i,
                        column: j
                    }
                } while (this.isPartOfMatch(i, j));
            }
        }
    }

    // locks a random Item and returns item coordinates, or false
    lockRandomItem() {
        let unlockedItems = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (!this.isLocked(i, j)) {
                    unlockedItems.push({
                        row: i,
                        column: j
                    })
                }
            }
        }
        if (unlockedItems.length > 0) {
            let item = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
            this.lockAt(item.row, item.column)
            return item;
        }
        return false;
    }

    // returns a random row number
    randomRow() {
        return Math.floor(Math.random() * this.rows);
    }

    // returns a random column number
    randomColumn() {
        return Math.floor(Math.random() * this.columns);
    }

    // locks the item at row, column
    lockAt(row, column) {
        this.gameArray[row][column].isLocked = true;
    }

    // returns true if item at row, column is locked
    isLocked(row, column) {
        return this.gameArray[row][column].isLocked;
    }

    // returns true if there is a match in the board
    matchInBoard() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.isPartOfMatch(i, j)) {
                    return true;
                }
            }
        }
        return false;
    }

    // returns true if the item at (row, column) is part of a match
    isPartOfMatch(row, column) {
        return this.isPartOfHorizontalMatch(row, column) || this.isPartOfVerticalMatch(row, column);
    }

    // returns true if the item at (row, column) is part of an horizontal match
    isPartOfHorizontalMatch(row, column) {
        return (this.valueAt(row, column) === this.valueAt(row, column - 1) && this.valueAt(row, column) === this.valueAt(row, column - 2)) ||
            (this.valueAt(row, column) === this.valueAt(row, column + 1) && this.valueAt(row, column) === this.valueAt(row, column + 2)) ||
            (this.valueAt(row, column) === this.valueAt(row, column - 1) && this.valueAt(row, column) === this.valueAt(row, column + 1));
    }

    // returns true if the item at (row, column) is part of an horizontal match
    isPartOfVerticalMatch(row, column) {
        return (this.valueAt(row, column) === this.valueAt(row - 1, column) && this.valueAt(row, column) === this.valueAt(row - 2, column)) ||
            (this.valueAt(row, column) === this.valueAt(row + 1, column) && this.valueAt(row, column) === this.valueAt(row + 2, column)) ||
            (this.valueAt(row, column) === this.valueAt(row - 1, column) && this.valueAt(row, column) === this.valueAt(row + 1, column));
    }

    // increments the value of the item
    incValueAt(row, column) {
        this.gameArray[row][column].value = (this.gameArray[row][column].value + 1) % this.items
    }

    // returns the value of the item at (row, column), or false if it's not a valid pick
    valueAt(row, column) {
        if (!this.validPick(row, column)) {
            return false;
        }
        return this.gameArray[row][column].value;
    }

    // returns the value of the item at (row + deltaRow, column + deltaColumn), wrapping around the array if necessary, or false if (row, column) is not a valid pick
    valueAtDelta(row, column, deltaRow, deltaColumn) {
        if (!this.validPick(row, column)) {
            return false;
        }
        let destinationRow = ((row + deltaRow) % this.getRows() + this.getRows()) % this.getRows();
        let destinationColumn = ((column + deltaColumn) % this.getColumns() + this.getColumns()) % this.getColumns();
        return this.valueAt(destinationRow, destinationColumn);
    }

    // returns true if the item at (row, column) is a valid pick
    validPick(row, column) {
        return row >= 0 && row < this.rows && column >= 0 && column < this.columns && this.gameArray[row] !== undefined && this.gameArray[row][column] !== undefined;
    }

    // outputs the values to console, useful for debugging
    logValues() {
        let output = "";
        for (let i = 0; i < this.getRows(); i++) {
            for (let j = 0; j < this.getColumns(); j++) {
                output += this.valueAt(i, j);
                output += " ";
            }
            output += "\n";
        }
        console.log(output);
    }

    // shifts a column by "offset" amount, returns an array with new gems position
    shiftColumnBy(column, offset) {
        // let resultArray = [];
        let tempArray = [];
        let moveArray = [];
        for (let i = 0; i < this.getRows(); i++) {
            tempArray[i] = Object.assign(this.gameArray[i][column]);
        }
        for (let i = 0; i < this.getRows(); i++) {
            let actualShift = ((i - offset) % this.getRows() + this.getRows()) % this.getRows();
            this.gameArray[i][column] = Object.assign(tempArray[actualShift]);
            moveArray.push({
                row: i,
                column: column,
                deltaRow: offset,
                deltaColumn: 0
            });
        }
        return moveArray;
    }

    // shifts a column by "offset" amount, returns an array with new gems position
    shiftRowBy(row, offset) {
        // let resultArray = [];
        let tempArray = [];
        let moveArray = [];
        for (let i = 0; i < this.getColumns(); i++) {
            tempArray[i] = Object.assign(this.gameArray[row][i]);
        }
        for (let i = 0; i < this.getColumns(); i++) {
            let actualShift = ((i - offset) % this.getColumns() + this.getColumns()) % this.getColumns();
            this.gameArray[row][i] = Object.assign(tempArray[actualShift]);
            moveArray.push({
                row: row,
                column: i,
                deltaRow: 0,
                deltaColumn: offset
            });
        }
        return moveArray;
    }

    // returns the number of board rows
    getRows() {
        return this.rows;
    }

    // returns the number of board columns
    getColumns() {
        return this.columns;
    }

    // sets a custom data on the item at (row, column)
    setCustomData(row, column, customData) {
        this.gameArray[row][column].customData = customData;
    }

    // returns the custom data of the item at (row, column)
    customDataOf(row, column) {
        return this.gameArray[row][column].customData;
    }

    // returns the selected item
    getSelectedItem() {
        return this.selectedItem;
    }

    // set the selected item as a {row, column} object
    setSelectedItem(row, column) {
        this.selectedItem = {
            row: row,
            column: column
        }
    }

    // deleselects any item
    deleselectItem() {
        this.selectedItem = false;
    }

    // checks if the item at (row, column) is the same as the item at (row2, column2)
    areTheSame(row, column, row2, column2) {
        return row === row2 && column === column2;
    }

    // returns true if two items at (row, column) and (row2, column2) are next to each other horizontally or vertically
    areNext(row, column, row2, column2) {
        return Math.abs(row - row2) + Math.abs(column - column2) === 1;
    }

    // swap the items at (row, column) and (row2, column2) and returns an object with movement information
    swapItems(row, column, row2, column2) {
        let tempObject = Object.assign(this.gameArray[row][column]);
        this.gameArray[row][column] = Object.assign(this.gameArray[row2][column2]);
        this.gameArray[row2][column2] = Object.assign(tempObject);
        return [{
            row: row,
            column: column,
            deltaRow: row - row2,
            deltaColumn: column - column2
        },
        {
            row: row2,
            column: column2,
            deltaRow: row2 - row,
            deltaColumn: column2 - column
        }]
    }

    // return the items part of a match in the board as an array of {row, column} object
    getMatchList() {
        let matches = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.isPartOfMatch(i, j)) {
                    matches.push({
                        row: i,
                        column: j
                    });
                }
            }
        }
        return matches;
    }

    // removes all items forming a match
    removeMatches() {
        let matches = this.getMatchList();
        matches.forEach(function (item) {
            this.setEmpty(item.row, item.column)
        }.bind(this))
    }

    // set the item at (row, column) as empty
    setEmpty(row, column) {
        this.gameArray[row][column].isEmpty = true;
    }

    // returns true if the item at (row, column) is empty
    isEmpty(row, column) {
        return this.gameArray[row][column].isEmpty;
    }

    // returns the amount of empty spaces below the item at (row, column)
    emptySpacesBelow(row, column) {
        let result = 0;
        if (row !== this.getRows()) {
            for (let i = row + 1; i < this.getRows(); i++) {
                if (this.isEmpty(i, column)) {
                    result++;
                }
            }
        }
        return result;
    }

    // arranges the board after a match, making items fall down. Returns an object with movement information
    arrangeBoardAfterMatch() {
        let result = []
        for (let i = this.getRows() - 2; i >= 0; i--) {
            for (let j = 0; j < this.getColumns(); j++) {
                let emptySpaces = this.emptySpacesBelow(i, j);
                if (!this.isEmpty(i, j) && emptySpaces > 0) {
                    this.swapItems(i, j, i + emptySpaces, j)
                    result.push({
                        row: i + emptySpaces,
                        column: j,
                        deltaRow: emptySpaces,
                        deltaColumn: 0
                    });
                }
            }
        }
        return result;
    }

    // replenished the board and returns an object with movement information
    replenishBoard() {
        let result = [];
        for (let i = 0; i < this.getColumns(); i++) {
            if (this.isEmpty(0, i)) {
                let emptySpaces = this.emptySpacesBelow(0, i) + 1;
                for (let j = 0; j < emptySpaces; j++) {
                    let randomValue = Math.floor(Math.random() * this.items);
                    result.push({
                        row: j,
                        column: i,
                        deltaRow: emptySpaces,
                        deltaColumn: 0
                    });
                    this.gameArray[j][i].value = randomValue;
                    this.gameArray[j][i].isEmpty = false;
                    this.gameArray[j][i].isLocked = false;
                }
            }
        }
        return result;
    }
}


export const scene = [
    mathGame
]
