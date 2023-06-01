import puppeteer from 'puppeteer-extra';
// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

const cityCode = process.argv[2];
//const kwCode = parseFloat(process.argv[3]);

// run npm start <numer ksiegi>

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        // slowMo: 50, // slow down by X ms
    });
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);
    const targetPage = page;

    await targetPage.setViewport({
        width: 1920,
        height: 727
    })
    {
        let currentCityCode = cityCode;
        let notFound = 0;
        let found = 0;

        for (let currentKWCode = 0; currentKWCode < 100000000; currentKWCode++) {
            const kwCodeString = String(currentKWCode).padStart(8, '0');
            await NavigateToPage();
            await EnterCityCode(currentCityCode);
            await FocusKWNumber();
            await EnterKWNumber(currentKWCode);

            await EnterChecksum('0');
            await ClickOutsideToClearErrors();

            let checksumToTry = 1;
            for (; checksumToTry < 10; checksumToTry++) {
                if (await IsError()) {
                    await EnterChecksum(checksumToTry + '');
                    await ClickOutsideToClearErrors();
                } else {
                    break;
                }
            }
            await Search();
            if (!await NotFoundTextPresent()) {
                const path = `results/result-${currentCityCode}-${kwCodeString}-${checksumToTry}.png`;
                await page.screenshot({ path: path, fullPage: true });
                console.log(`found: ${currentCityCode}/${kwCodeString}/${checksumToTry} screenshot: ${path}`)
                found += 1;
            } else {
                notFound += 1;
                console.log(`not found: ${currentCityCode}/${kwCodeString}`)
            }
            console.log(`found: ${found} notFound: ${notFound}`);
        }

    }


    await browser.close();
    async function NotFoundTextPresent() {
        let errorText = await page.evaluate(() => {
            let el = document.querySelector('#content-wrapper > div > div:nth-child(2) > div');
            return el ? el.innerText : ""
        });
        return errorText.indexOf('nie została odnaleziona.') !== -1;
    }
    async function NavigateToPage() {
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        await targetPage.goto('https://przegladarka-ekw.ms.gov.pl/eukw_prz/KsiegiWieczyste/wyszukiwanieKW');
        await Promise.all(promises);
    }

    /** {string} code 'GD1G' */
    async function EnterCityCode(code) {
        {

            await scrollIntoViewIfNeeded([
                [
                    '#kodWydzialuInput'
                ]
            ], targetPage, timeout);
            const element = await waitForSelectors([
                [
                    '#kodWydzialuInput'
                ]
            ], targetPage, { timeout, visible: true });
            await element.click({
                offset: {
                    x: 73.5,
                    y: 15.25,
                },
            });
        }
        {

            await scrollIntoViewIfNeeded([
                [
                    '#kodWydzialuInput'
                ]
            ], targetPage, timeout);
            const element = await waitForSelectors([
                [
                    '#kodWydzialuInput'
                ]
            ], targetPage, { timeout, visible: true });
            const inputType = await element.evaluate(el => el.type);
            if (inputType === 'select-one') {
                await changeSelectElement(element, code);
            } else if ([
                'textarea',
                'text',
                'url',
                'tel',
                'search',
                'password',
                'number',
                'email'
            ].includes(inputType)) {
                await typeIntoElement(element, code);
            } else {
                await changeElementValue(element, code);
            }
        }
        await scrollIntoViewIfNeeded([
            [
                'span.activated'
            ]
        ], targetPage, timeout);
        const element = await waitForSelectors([
            [
                'span.activated'
            ]
        ], targetPage, { timeout, visible: true });
        await element.click({
            offset: {
                x: 70.5,
                y: 37.25,
            },
        });
    }

    async function FocusKWNumber() {
        await scrollIntoViewIfNeeded([
            [
                '#numerKsiegiWieczystej'
            ]
        ], targetPage, timeout);
        const element = await waitForSelectors([
            [
                '#numerKsiegiWieczystej'
            ]
        ], targetPage, { timeout, visible: true });
        await element.click({
            offset: {
                x: 34.59375,
                y: 14.25,
            },
        });
    }

    /** @param {number} kwNumber  */
    async function EnterKWNumber(kwNumber) {
        await scrollIntoViewIfNeeded([
            [
                '#numerKsiegiWieczystej'
            ]
        ], targetPage, timeout);
        const element = await waitForSelectors([
            [
                '#numerKsiegiWieczystej'
            ]
        ], targetPage, { timeout, visible: true });
        const inputType = await element.evaluate(el => el.type);
        if (inputType === 'select-one') {
            await changeSelectElement(element, kwNumber + '');
        } else if ([
            'textarea',
            'text',
            'url',
            'tel',
            'search',
            'password',
            'number',
            'email'
        ].includes(inputType)) {
            await typeIntoElement(element, kwNumber + '');
        } else {
            await changeElementValue(element, kwNumber + '');
        }
    }

    async function Search() {
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        await scrollIntoViewIfNeeded([
            [
                '#wyszukaj'
            ],
            [
                'text/Wyszukaj Księgę'
            ]
        ], targetPage, timeout);
        const element = await waitForSelectors([
            [
                '#wyszukaj'
            ],
            [
                'text/Wyszukaj Księgę'
            ]
        ], targetPage, { timeout, visible: true });
        await element.click({
            offset: {
                x: 53.375,
                y: 20.25,
            },
        });
        await Promise.all(promises);
    }

    async function IsError() {
        try {
            const element = await waitForSelector('.error.visible', targetPage, { timeout, visible: true });
            return true;
        } catch (e) {
            return false;
        }
    }
    async function ClickOutsideToClearErrors() {
        await scrollIntoViewIfNeeded([
            [
                'div.button-row'
            ],
            [
                'text/Wróć do strony głównej\n\t\t\n\n'
            ]
        ], targetPage, timeout);
        const element = await waitForSelectors([
            [
                'div.button-row'
            ],
            [
                'text/Wróć do strony głównej\n\t\t\n\n'
            ]
        ], targetPage, { timeout, visible: true });
        await element.click({
            offset: {
                x: 618.5,
                y: 147.5,
            },
        });
    }

    async function EnterChecksum(cyfra) {
        await scrollIntoViewIfNeeded([
            [
                '#cyfraKontrolna'
            ]
        ], targetPage, timeout);
        const element = await waitForSelectors([
            [
                '#cyfraKontrolna'
            ]
        ], targetPage, { timeout, visible: true });
        const inputType = await element.evaluate(el => el.type);
        if (inputType === 'select-one') {
            await changeSelectElement(element, cyfra);
        } else if ([
            'textarea',
            'text',
            'url',
            'tel',
            'search',
            'password',
            'number',
            'email'
        ].includes(inputType)) {
            await typeIntoElement(element, cyfra);
        } else {
            await changeElementValue(element, cyfra);
        }
    }

    async function waitForSelectors(selectors, frame, options) {
        for (const selector of selectors) {
            try {
                return await waitForSelector(selector, frame, options);
            } catch (err) {
                console.error(err);
            }
        }
        throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }

    async function scrollIntoViewIfNeeded(selectors, frame, timeout) {
        const element = await waitForSelectors(selectors, frame, { visible: false, timeout });
        if (!element) {
            throw new Error(
                'The element could not be found.'
            );
        }
        await waitForConnected(element, timeout);
        const isInViewport = await element.isIntersectingViewport({ threshold: 0 });
        if (isInViewport) {
            return;
        }
        await element.evaluate(element => {
            element.scrollIntoView({
                block: 'center',
                inline: 'center',
                behavior: 'auto',
            });
        });
        await waitForInViewport(element, timeout);
    }

    async function waitForConnected(element, timeout) {
        await waitForFunction(async () => {
            return await element.getProperty('isConnected');
        }, timeout);
    }

    async function waitForInViewport(element, timeout) {
        await waitForFunction(async () => {
            return await element.isIntersectingViewport({ threshold: 0 });
        }, timeout);
    }

    async function waitForSelector(selector, frame, options) {
        if (!Array.isArray(selector)) {
            selector = [selector];
        }
        if (!selector.length) {
            throw new Error('Empty selector provided to waitForSelector');
        }
        let element = null;
        for (let i = 0; i < selector.length; i++) {
            const part = selector[i];
            if (element) {
                element = await element.waitForSelector(part, options);
            } else {
                element = await frame.waitForSelector(part, options);
            }
            if (!element) {
                throw new Error('Could not find element: ' + selector.join('>>'));
            }
            if (i < selector.length - 1) {
                element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            }
        }
        if (!element) {
            throw new Error('Could not find element: ' + selector.join('|'));
        }
        return element;
    }

    async function waitForElement(step, frame, timeout) {
        const {
            count = 1,
            operator = '>=',
            visible = true,
            properties,
            attributes,
        } = step;
        const compFn = {
            '==': (a, b) => a === b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
        }[operator];
        await waitForFunction(async () => {
            const elements = await querySelectorsAll(step.selectors, frame);
            let result = compFn(elements.length, count);
            const elementsHandle = await frame.evaluateHandle((...elements) => {
                return elements;
            }, ...elements);
            await Promise.all(elements.map((element) => element.dispose()));
            if (result && (properties || attributes)) {
                result = await elementsHandle.evaluate(
                    (elements, properties, attributes) => {
                        for (const element of elements) {
                            if (attributes) {
                                for (const [name, value] of Object.entries(attributes)) {
                                    if (element.getAttribute(name) !== value) {
                                        return false;
                                    }
                                }
                            }
                            if (properties) {
                                if (!isDeepMatch(properties, element)) {
                                    return false;
                                }
                            }
                        }
                        return true;

                        function isDeepMatch(a, b) {
                            if (a === b) {
                                return true;
                            }
                            if ((a && !b) || (!a && b)) {
                                return false;
                            }
                            if (!(a instanceof Object) || !(b instanceof Object)) {
                                return false;
                            }
                            for (const [key, value] of Object.entries(a)) {
                                if (!isDeepMatch(value, b[key])) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    },
                    properties,
                    attributes
                );
            }
            await elementsHandle.dispose();
            return result === visible;
        }, timeout);
    }

    async function querySelectorsAll(selectors, frame) {
        for (const selector of selectors) {
            const result = await querySelectorAll(selector, frame);
            if (result.length) {
                return result;
            }
        }
        return [];
    }

    async function querySelectorAll(selector, frame) {
        if (!Array.isArray(selector)) {
            selector = [selector];
        }
        if (!selector.length) {
            throw new Error('Empty selector provided to querySelectorAll');
        }
        let elements = [];
        for (let i = 0; i < selector.length; i++) {
            const part = selector[i];
            if (i === 0) {
                elements = await frame.$$(part);
            } else {
                const tmpElements = elements;
                elements = [];
                for (const el of tmpElements) {
                    elements.push(...(await el.$$(part)));
                }
            }
            if (elements.length === 0) {
                return [];
            }
            if (i < selector.length - 1) {
                const tmpElements = [];
                for (const el of elements) {
                    const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
                    if (newEl) {
                        tmpElements.push(newEl);
                    }
                }
                elements = tmpElements;
            }
        }
        return elements;
    }

    async function waitForFunction(fn, timeout) {
        let isActive = true;
        const timeoutId = setTimeout(() => {
            isActive = false;
        }, timeout);
        while (isActive) {
            const result = await fn();
            if (result) {
                clearTimeout(timeoutId);
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw new Error('Timed out');
    }

    async function changeSelectElement(element, value) {
        await element.select(value);
        await element.evaluateHandle((e) => {
            e.blur();
            e.focus();
        });
    }

    async function changeElementValue(element, value) {
        await element.focus();
        await element.evaluate((input, value) => {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }, value);
    }

    async function typeIntoElement(element, value) {
        const textToType = await element.evaluate((input, newValue) => {
            if (
                newValue.length <= input.value.length ||
                !newValue.startsWith(input.value)
            ) {
                input.value = '';
                return newValue;
            }
            const originalValue = input.value;
            input.value = '';
            input.value = originalValue;
            return newValue.substring(originalValue.length);
        }, value);
        await element.type(textToType);
    }
})().catch(err => {
    console.error(err);
    process.exit(1);
});
