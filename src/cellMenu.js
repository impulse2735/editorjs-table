import {create} from "./documentUtils"
import chevronDown from "./img/chevron-down.svg"

const COLORS = [
    "#ffffff",
    "#e0ebfd",
    "#eafbfe",
    "#e8fbf0",
    "#fefae8",
    "#fcece7",
    "#e9e6fd",
    "#f4f5f7",
    "#b9d4fb",
    "#c1f3fd",
    "#bbf3d3",
    "#fcf0ba",
    "#f5c0b0",
    "#b4bac4",
    "#5f9af8",
    "#93dfef",
    "#7cd5a7",
    "#f6c544",
    "#f0957a",
    "#978ed4",
]

const FONTSIZES = [
    10,
    12,
    14,
    16,
    18
]

export class CellMenu {
    constructor(table, config, api) {
        this.table = table
        this._colors = config.colors || COLORS
        this._fontSizes = config.fontSizes || FONTSIZES
        this.api = api

        /**
         * FIXME: 테이블 셀 메뉴와 컬러 팔레트가 무한 생성되는 현상을 수정해야 합니다.
         */
        this._init()
        this._fillCellMenu()
    }

    createElem(cell) {
        const openCellMenuButton = create("button", [CSS.openCellMenuButton])
        const iconContainer = create("div", [CSS.iconBox])

        iconContainer.innerHTML = chevronDown

        openCellMenuButton.appendChild(iconContainer)
        openCellMenuButton.addEventListener("mousedown", this._handleMouseDown.bind(this))
        openCellMenuButton.addEventListener("click", this._handleCellMenuButtonClick.bind(this))
        cell.appendChild(openCellMenuButton)
    }

    _hideCellMenu(event) {
        if (!event.target || event.target.closest("." + CSS.openCellMenuButton)) return
        this.container.style.visibility = "hidden"
        this.table.body.querySelectorAll("." + CSS.iconBox).forEach((iconBox) => {
            iconBox.classList.remove("activated")
        })
    }

    _createMergeButton() {
        const option = document.createElement("button")

        option.textContent = this.api.i18n.t("Merge Cells")

        option.classList.add(CSS.option)
        option.classList.add(CSS.mergeOption)
        option.addEventListener("click", this.mergeCells.bind(this))

        return option
    }

    _createUnmergeButton() {
        const option = document.createElement("button")

        option.textContent = this.api.i18n.t("Divide Cell")

        option.classList.add(CSS.option)
        option.classList.add(CSS.unmergeOption)
        option.addEventListener("click", this.unmerge.bind(this))

        return option
    }

    _createAddColumnOnRightButton() {
        const option = document.createElement("button")

        option.textContent = this.api.i18n.t("Insert Column On Right")

        option.classList.add(CSS.option)
        option.addEventListener("click", this.addColumnOnRight.bind(this))

        return option
    }

    _createAddRowBelow() {
        const option = document.createElement("button")

        option.textContent = this.api.i18n.t("Insert Row Below")

        option.classList.add(CSS.option)
        option.addEventListener("click", this.addRowBelow.bind(this))

        return option
    }

    _createColRemoveButton() {
        const option = document.createElement("button")

        const removeSelectedCols = (event) => {
            const focusedCell = this.selectedCell
            const selectedCols = this.selectedCols

            if (selectedCols.length === 0) {
                this.removeColumn(focusedCell.cellIndex)
                return
            }

            selectedCols.forEach((row, i) => {
                this.removeColumn(row - i)
            })
        }

        option.textContent = this.api.i18n.t("Remove Column")

        option.classList.add(CSS.option)
        option.addEventListener("click", removeSelectedCols.bind(this))

        return option
    }

    _createRowRemoveButton() {
        const option = document.createElement("button")

        const removeSelectedRows = (event) => {
            const focusedCell = this.selectedCell
            const selectedRows = this.selectedRows

            if (selectedRows.length === 0) {
                this.removeRow(focusedCell.parentNode.rowIndex)
                return
            }

            selectedRows.forEach((row, i) => {
                this.removeRow(row - i)
            })
        }

        // 삭제할 행을 표시해주는 기능을 추가한다
        // https://stackoverflow.com/questions/49106088/changing-pseudo-element-style-from-javascript
        const highlightCells = (event) => {
            // const focusedCell = this.selectedCell;
            // const selectedCells = this._table.querySelectorAll('.selected');
            // if (selectedCells.length === 0) {
            //   focusedCell.parentNode.classList.add(SelectLineCSS.trRemove);
            //   return;
            // }
            // const topLeftRow = selectedCells[0].parentNode.rowIndex;
            // const bottomRightRow = selectedCells[selectedCells.length - 1].parentNode.rowIndex;
            // for (let i = topLeftRow; i <= bottomRightRow; i++) {
            //   this._table.rows[i].classList.add(SelectLineCSS.trRemove);
            // }
        }

        option.textContent = this.api.i18n.t("Remove Row")

        option.classList.add(CSS.option)
        option.addEventListener("click", removeSelectedRows.bind(this))
        // option.addEventListener("mouseenter", highlightCells.bind(this))

        return option
    }

    _createColorPickerButton() {
        const option = document.createElement("button")

        option.textContent = this.api.i18n.t("Cell Color")

        option.classList.add(CSS.option)
        option.classList.add(CSS.colorOption)

        option.addEventListener("mouseenter", (event) => {
            const {top, left} = option.getBoundingClientRect()
            const scrollY = Math.floor(window.scrollY)
            const {width} = this.colorPalette.getBoundingClientRect()

            this.colorPalette.style.top = `${Math.floor(top) + scrollY}px`
            this.colorPalette.style.left = `${left - width}px`
            this.colorPalette.style.visibility = "visible"
        })

        option.addEventListener("mouseleave", (event) => {
            this.colorPalette.style.visibility = "hidden"
        })

        return option
    }

    _changeCellColor(event) {
        if (event.target.closest("." + CSS.colorBlock)) {
            const color =
                event.target.dataset.color === this._colors[0] ? null : event.target.dataset.color
            const selectedRows = this.table.selectedRows
            const selectedCols = this.table.selectedCols
            const selectedCell = this.table.selectedCell

            this.colorPalette.style.visibility = "hidden"
            this._hideCellMenu(event)

            if (!selectedRows.length && !selectedCols.length) {
                selectedCell.style.backgroundColor = color
                this.table.deselectCells()
                return
            }

            for (let i = selectedRows[0]; i <= selectedRows[selectedRows.length - 1]; i++) {
                for (let j = selectedCols[0]; j <= selectedCols[selectedCols.length - 1]; j++) {
                    const cell = this.table.body.rows[i].cells[j]
                    cell.style.backgroundColor = color
                }
            }

            this.table.deselectCells()
        }
    }

    _hideColorPalette() {
        this.colorPalette.style.visibility = "hidden"
    }

    _showColorPalette() {
        this.colorPalette.style.visibility = "visible"
    }

    _createToggleFirstRowHeaderButton() {
        const option = document.createElement("button")

        option.textContent = this.api.i18n.t("Header Row")

        option.classList.add(CSS.option)
        option.classList.add(CSS.toggleRowHeaderOption)

        option.addEventListener("click", this.toggleFirstRowHeader.bind(this))

        return option
    }

    _createToggleFirstColHeaderButton() {
        const option = document.createElement("button")

        option.textContent = this.api.i18n.t("Header Column")

        option.classList.add(CSS.option)
        option.classList.add(CSS.toggleColHeaderOption)

        option.addEventListener("click", this.toggleFirstColHeader.bind(this))

        return option
    }

    _fillCellMenu() {
        const colorPickerButton = this._createColorPickerButton()
        const toggleFirstRowHeaderButton = this._createToggleFirstRowHeaderButton.call(this.table)
        const toggleFirstColHeaderButton = this._createToggleFirstColHeaderButton.call(this.table)
        const addColumnOnRightButton = this._createAddColumnOnRightButton.call(this.table)
        const addRowBelowButton = this._createAddRowBelow.call(this.table)
        const mergeButton = this._createMergeButton.call(this.table)
        const unmergeButton = this._createUnmergeButton.call(this.table)
        const rowRemoveButton = this._createRowRemoveButton.call(this.table)
        const colRemoveButton = this._createColRemoveButton.call(this.table)

        this._cellMenuInner.appendChild(colorPickerButton)
        this._cellMenuInner.appendChild(toggleFirstRowHeaderButton)
        this._cellMenuInner.appendChild(toggleFirstColHeaderButton)
        this._cellMenuInner.appendChild(addColumnOnRightButton)
        this._cellMenuInner.appendChild(addRowBelowButton)
        this._cellMenuInner.appendChild(mergeButton)
        this._cellMenuInner.appendChild(unmergeButton)
        this._cellMenuInner.appendChild(rowRemoveButton)
        this._cellMenuInner.appendChild(colRemoveButton)
    }

    /**
     * 메뉴 창 닫기를 방지합니다.
     *
     * @param {MouseEvent} event
     */
    _handleMouseDown(event) {
        event.preventDefault()
    }

    _handleCellMenuButtonClick(event) {
        const openCellMenuButton = event.target.closest("." + CSS.openCellMenuButton)
        const iconBox = openCellMenuButton.querySelector("." + CSS.iconBox)
        const mergeOption = this.container.querySelector("." + CSS.mergeOption)
        const unmergeOption = this.container.querySelector("." + CSS.unmergeOption)
        const toggleRowHeaderOption = this.container.querySelector("." + CSS.toggleRowHeaderOption)
        const toggleColHeaderOption = this.container.querySelector("." + CSS.toggleColHeaderOption)
        const {top, right} = iconBox.getBoundingClientRect()
        const scrollY = Math.floor(window.scrollY)
        const isMergePossible = this.table.checkIfMergePossible.call(this.table)
        const isCurrentCellMerged =
            this.table.selectedCell.colSpan > 1 || this.table.selectedCell.rowSpan > 1
        const isToggleRowHeaderPossible = this.table.selectedCell.parentNode.rowIndex === 0
        const isToggleColHeaderPossible = this.table.selectedCell.cellIndex === 0

        const fontBold = this.colorPalette.querySelector("." + CSS.textStyleBlockBold);
        const isToggleFontBold = this.table.getStyle(this.table.selectedCell, 'font-weight') !== '400';
        if(fontBold){
            if (isToggleFontBold) {
                fontBold.classList.add(CSS.activeTextStyle)
            }else{
                fontBold.classList.remove(CSS.activeTextStyle)
            }
        }

        const fontItalic = this.colorPalette.querySelector("." + CSS.textStyleBlockItalic);
        const isToggleFontItalic = this.table.getStyle(this.table.selectedCell, 'font-style') === 'italic';
        if(fontItalic){
            if (isToggleFontItalic) {
                fontItalic.classList.add(CSS.activeTextStyle)
            }else{
                fontItalic.classList.remove(CSS.activeTextStyle)
            }
        }

        const fontUnderline = this.colorPalette.querySelector("." + CSS.textStyleBlockUnderline);
        const isToggleFontUnderline = this.table.getStyle(this.table.selectedCell, 'text-decoration').search(/underline/) >= 0;
        if(fontUnderline){
            if (isToggleFontUnderline) {
                fontUnderline.classList.add(CSS.activeTextStyle)
            }else{
                fontUnderline.classList.remove(CSS.activeTextStyle)
            }
        }

        const fontSize = this.colorPalette.querySelector("." + CSS.selectStyle);
        const size = this.table.getStyle(this.table.selectedCell, 'font-size').replace('px','');
        if(fontSize && size){
            fontSize.value = size;
        }


        const fontAlignLeft = this.colorPalette.querySelector("." + CSS.textStyleBlockFontAlignLeft);
        const isToggleFontAlignLeft = this.table.getStyle(this.table.selectedCell, 'text-align') === 'left';
        if(fontAlignLeft){
            if (isToggleFontAlignLeft) {
                fontAlignLeft.classList.add(CSS.activeTextStyle)
            }else{
                fontAlignLeft.classList.remove(CSS.activeTextStyle)
            }
        }

        const fontAlignCenter = this.colorPalette.querySelector("." + CSS.textStyleBlockFontAlignCenter);
        const isToggleFontAlignCenter = this.table.getStyle(this.table.selectedCell, 'text-align') === 'center';
        if(fontAlignCenter){
            if (isToggleFontAlignCenter) {
                fontAlignCenter.classList.add(CSS.activeTextStyle)
            }else{
                fontAlignCenter.classList.remove(CSS.activeTextStyle)
            }
        }

        const fontAlignRight = this.colorPalette.querySelector("." + CSS.textStyleBlockFontAlignRight);
        const isToggleFontAlignRight = this.table.getStyle(this.table.selectedCell, 'text-align') === 'right';
        if(fontAlignRight){
            if (isToggleFontAlignRight) {
                fontAlignRight.classList.add(CSS.activeTextStyle)
            }else{
                fontAlignRight.classList.remove(CSS.activeTextStyle)
            }
        }

        iconBox.classList.add("activated")

        this.container.style.top = `${Math.floor(top) + scrollY}px`
        this.container.style.left = `${right + 4}px`
        this.container.style.visibility = "visible"

        if (isToggleRowHeaderPossible) {
            toggleRowHeaderOption.style.display = "flex"

            this.table.isRowHeaderOn
                ? toggleRowHeaderOption.classList.add(CSS.rowHeaderOn)
                : toggleRowHeaderOption.classList.remove(CSS.rowHeaderOn)
        } else {
            toggleRowHeaderOption.style.display = "none"
        }

        if (isToggleColHeaderPossible) {
            toggleColHeaderOption.style.display = "flex"

            this.table.isColHeaderOn
                ? toggleColHeaderOption.classList.add(CSS.colHeaderOn)
                : toggleColHeaderOption.classList.remove(CSS.colHeaderOn)
        } else {
            toggleColHeaderOption.style.display = "none"
        }

        if (isMergePossible) {
            mergeOption.disabled = false
        } else {
            mergeOption.disabled = true
        }

        if (isCurrentCellMerged) {
            unmergeOption.style.display = "flex"
        } else {
            unmergeOption.style.display = "none"
        }
    }

    _init() {
        const cellMenuInner = document.createElement("div")
        cellMenuInner.classList.add(CSS.cellMenuInner)

        const cellMenu = document.createElement("div")
        cellMenu.appendChild(cellMenuInner)
        cellMenu.classList.add(CSS.cellMenu)

        const colorPalette = document.createElement("div")
        colorPalette.classList.add(CSS.colorPalette)

        const fontBold = document.createElement("figure")
        fontBold.classList.add(CSS.textStyleBlock)
        fontBold.classList.add(CSS.textStyleBlockBold)
        fontBold.innerHTML = 'T'
        fontBold.addEventListener("click", this._fireEventAndClose.bind(this,this.table.setFontBold.bind(this.table)) )
        colorPalette.appendChild(fontBold)

        const fontItalic = document.createElement("figure")
        fontItalic.classList.add(CSS.textStyleBlock)
        fontItalic.classList.add(CSS.textStyleBlockItalic)
        fontItalic.innerHTML = 'T'
        fontItalic.addEventListener("click", this._fireEventAndClose.bind(this,this.table.setFontItalic.bind(this.table)))
        colorPalette.appendChild(fontItalic)

        const fontUnderline = document.createElement("figure")
        fontUnderline.classList.add(CSS.textStyleBlock)
        fontUnderline.classList.add(CSS.textStyleBlockUnderline)
        fontUnderline.innerHTML = 'T'
        fontUnderline.addEventListener("click", this._fireEventAndClose.bind(this,this.table.setFontUnderline.bind(this.table)))
        colorPalette.appendChild(fontUnderline)

        const fontSize = document.createElement("select")
        fontSize.classList.add(CSS.textStyleBlock)
        fontSize.classList.add(CSS.selectStyle)

        for (let i = 0; i < this._fontSizes.length; i++) {
            const option = document.createElement("option");
            option.value = this._fontSizes[i];
            option.text = this._fontSizes[i];
            fontSize.appendChild(option);
        }

        fontSize.addEventListener("change", this._fireEventSelectAndClose.bind(this,this.table.setFontSize.bind(this.table)))

        colorPalette.appendChild(fontSize)

        const fontAlignLeft = document.createElement("figure")
        fontAlignLeft.classList.add(CSS.textStyleBlock)
        fontAlignLeft.classList.add(CSS.textStyleBlockFontAlignLeft)
        fontAlignLeft.innerHTML = '&nbsp;L'
        fontAlignLeft.addEventListener("click", this._fireEventAlignAndClose.bind(this,this.table.setFontAlign.bind(this.table)))
        colorPalette.appendChild(fontAlignLeft)

        const fontAlignCenter = document.createElement("figure")
        fontAlignCenter.classList.add(CSS.textStyleBlock)
        fontAlignCenter.classList.add(CSS.textStyleBlockFontAlignCenter)
        fontAlignCenter.innerHTML = '&nbsp;C'
        fontAlignCenter.addEventListener("click", this._fireEventAlignAndClose.bind(this,this.table.setFontAlign.bind(this.table)))
        colorPalette.appendChild(fontAlignCenter)

        const fontAlignRight = document.createElement("figure")
        fontAlignRight.classList.add(CSS.textStyleBlock)
        fontAlignRight.classList.add(CSS.textStyleBlockFontAlignRight)
        fontAlignRight.innerHTML = '&nbsp;R'
        fontAlignRight.addEventListener("click", this._fireEventAlignAndClose.bind(this,this.table.setFontAlign.bind(this.table)))
        colorPalette.appendChild(fontAlignRight)

        const separator = document.createElement("div");
        separator.classList.add(CSS.separatorStyle);
        colorPalette.appendChild(separator)

        this._colors.forEach((color,index) => {
            if(index && index % 10 === 0){
                const separator = document.createElement("div");
                separator.classList.add(CSS.separatorStyle);
                colorPalette.appendChild(separator)
            }
            const colorBlock = document.createElement("figure")
            colorBlock.style.backgroundColor = color
            colorBlock.classList.add(CSS.colorBlock)
            colorBlock.setAttribute("data-color", color);
            colorBlock.addEventListener("click", this._changeCellColor.bind(this))
            colorPalette.appendChild(colorBlock)
        })


        this.container = cellMenu
        this.colorPalette = colorPalette
        this._cellMenuInner = cellMenuInner

        this._cellMenuInner.addEventListener("click", this._catchClickEventDelegation.bind(this))
        this.colorPalette.addEventListener("mouseenter", this._showColorPalette.bind(this))
        this.colorPalette.addEventListener("mouseleave", this._hideColorPalette.bind(this))

        document.body.appendChild(cellMenu)
        document.body.appendChild(colorPalette)
        document.addEventListener("click", this._hideCellMenu.bind(this))
    }
    _fireEventAndClose(callback,event){
        callback();
        this._hideColorPalette()
        this._hideCellMenu(event)
    }
    _fireEventAlignAndClose(callback,event){
        let align = 'left';
        if(event.target.classList.contains(CSS.textStyleBlockFontAlignCenter)){
            align = 'center';
        }else if(event.target.classList.contains(CSS.textStyleBlockFontAlignRight)){
            align = 'right';
        }
        callback(align);
        this._hideColorPalette()
        this._hideCellMenu(event)
    }
    _fireEventSelectAndClose(callback,event){
        callback(event.target.value);
        this._hideColorPalette()
        this._hideCellMenu(event)
    }
    _catchClickEventDelegation(event) {
        if (event.target.classList.contains(CSS.option)) {
            this._hideCellMenu(event)
        }
    }
}

export const CSS = {
    openCellMenuButton: "tc-table__option_button",
    iconBox: "tc-table__option_button__inner_box",
    cellMenu: "tc-table__option_table",
    cellMenuInner: "tc-table__option_table__inner",
    option: "tc-table__option_table__inner__option",
    mergeOption: "merge-option",
    unmergeOption: "unmerge-option",
    colorOption: "color-option",
    colorPalette: "tc-table__color-palette",
    colorBlock: "color-block",
    textStyleBlock: 'text-style-block',
    textStyleBlockBold: 'text-style-block-bold',
    textStyleBlockItalic: 'text-style-block-italic',
    textStyleBlockUnderline: 'text-style-block-underline',
    textStyleBlockFontAlignLeft: 'text-style-block-align-left',
    textStyleBlockFontAlignCenter: 'text-style-block-align-center',
    textStyleBlockFontAlignRight: 'text-style-block-align-right',
    separatorStyle: 'separator',
    selectStyle: 'select-elem',
    toggleRowHeaderOption: "toggle-row-header-option",
    fontBold: 'font-bold-option',
    toggleFontBold: 'font-bold',
    toggleColHeaderOption: "toggle-col-header-option",
    rowHeaderOn: "row-header-on",
    colHeaderOn: "col-header-on",
    activeTextStyle: 'active-text-style'
}
