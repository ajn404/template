<template>
    <div id="calculator">
        <div class="top">
            <span class="clear" @click="clearScreen">C</span>
            <div class="screen">{{ screenContent || '0' }}</div>
        </div>

        <div class="keys">
            <span v-for="(key, index) in keyConfig" :key="index" :class="[key.class, { operator: key.isOperator }]"
                @click="handleClick(key.value)">
                {{ key.display }}
            </span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            screenContent: '',
            decimalAdded: false,
            keyConfig: [
                { display: '7', value: '7' },
                { display: '8', value: '8' },
                { display: '9', value: '9' },
                { display: '+', value: '+', class: 'operator', isOperator: true },
                { display: '4', value: '4' },
                { display: '5', value: '5' },
                { display: '6', value: '6' },
                { display: '-', value: '-', class: 'operator', isOperator: true },
                { display: '1', value: '1' },
                { display: '2', value: '2' },
                { display: '3', value: '3' },
                { display: '÷', value: '/', class: 'operator', isOperator: true },
                { display: '0', value: '0' },
                { display: '.', value: '.', class: 'decimal' },
                { display: '=', value: '=', class: 'eval' },
                { display: 'x', value: '*', class: 'operator', isOperator: true }
            ]
        }
    },
    methods: {
        handleClick(value) {
            const operators = ['+', '-', '*', '/']
            const lastChar = this.screenContent.slice(-1)

            switch (value) {
                case 'C':
                    this.clearScreen()
                    break
                case '=':
                    try {
                        let equation = this.screenContent.replace(/x/g, '*').replace(/÷/g, '/')
                        if (operators.includes(lastChar) || lastChar === '.') {
                            equation = equation.slice(0, -1)
                        }
                        const result = eval(equation) || ''
                        this.screenContent = result % 1 === 0 ? result : result.toFixed(2)
                        this.decimalAdded = false
                    } catch {
                        this.screenContent = 'Error'
                    }
                    break
                case '.':
                    if (!this.decimalAdded) {
                        this.screenContent += value
                        this.decimalAdded = true
                    }
                    break
                default:
                    if (operators.includes(value)) {
                        if (this.screenContent === '' && value === '-') {
                            this.screenContent += value
                        } else if (!operators.includes(lastChar)) {
                            this.screenContent += value
                            this.decimalAdded = false
                        } else if (this.screenContent.length > 1) {
                            this.screenContent = this.screenContent.slice(0, -1) + value
                        }
                    } else {
                        this.screenContent += value
                    }
            }
        },
        clearScreen() {
            this.screenContent = ''
            this.decimalAdded = false
        }
    }
}
</script>

<style scoped lang="less">
#calculator {
    width: 325px;
    height: 374px;
    overflow: hidden;
    position: relative;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 9px;
    box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
    padding: 20px 20px 19px;
    margin: 0 auto;
}


.top span.clear {
    position: absolute;
    z-index: 6;

}


.top .screen {
    height: 80px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    padding: 20px 10px;
    background: rgba(0, 0, 0, 0.2);
    font-size: 27px;
    font-weight: normal;
    line-height: 40px;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    text-align: right;
    letter-spacing: 1px;
}

.keys,
.top {
    overflow: hidden;
}


.keys span,
.top span.clear {
    float: left;
    position: relative;
    top: 0;

    cursor: pointer;

    width: 66px;
    height: 56px;

    background: rgba(0, 0, 0, 0.6);
    border-radius: 6px;
    box-shadow: 0px 4px rgba(0, 0, 0, 0.2);

    margin: 0 7px 11px 0;

    color: #ddd;
    line-height: 56px;
    text-align: center;

    user-select: none;


    transition: all 0.2s ease;
}


.keys span.operator {
    background: rgba(250, 100, 0, 0.6);
    margin-right: 0;
}

.keys span.eval {

    color: #888e5f;
}

.top span.clear {
    background: transparent;
    box-shadow: none;
    color: #aaa;
    width: 56px;
    left: 5px
}


.keys span:hover {
    background: rgba(255, 255, 255, 0.8);
    color: #333;
}

.keys span.eval:hover {
    background: #abb850;
    color: #ffffff;
}

.top span.clear:hover {
    border-radius: 190px;
    background: rgba(0, 0, 0, 0.1);
    color: white;
}

.keys span:active {
    box-shadow: 0px 0px rgba(0, 0, 0, 0.2);
    top: 4px;
}

.keys span.eval:active {
    box-shadow: 0px 0px #717a33;
    top: 4px;
}

.top span.clear:active {
    top: 4px;
    box-shadow: 0px 0px #d3545d;
}
</style>
