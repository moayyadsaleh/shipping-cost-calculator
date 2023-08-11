const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
// Set the view engine to EJS
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Conversion functions
function poundsToKg(pounds) {
    return (pounds * 0.45359237).toFixed(2);
}

function kgToPounds(kg) {
    return (kg * 2.20462).toFixed(2);
}

function dollarsToJD(dollars) {
    const conversionRate = 0.71; // 1 USD = 0.71 JD
    return (dollars * conversionRate).toFixed(2);
}

function jdToDollars(jd) {
    const conversionRate = 1.41; // 1 JD = 1.41 USD
    return (jd * conversionRate).toFixed(2);
}
function calculateShippingCost(weight, currency) {
    const halfKgRate = 20;
    const extraHalfKgRate = 8;
    const extraKgRate = 8;

    let cost = 0;

    if (weight <= 0.5) {
        cost = halfKgRate;
    } else if (weight <= 15) {
        const extraHalfKgs = Math.ceil((weight - 0.5) / 0.5);
        cost = halfKgRate + (extraHalfKgs * extraHalfKgRate);
    } else if (weight <= 30) {
        const extraKgs = Math.ceil(weight - 15);
        cost = halfKgRate + (15 * extraHalfKgRate) + (extraKgs * extraKgRate);
    }

    if (currency === 'usd') {
        const exchangeRate = 0.71; // 1 JD = 0.71 USD
        cost *= exchangeRate;
    }

    return Math.round(cost * 100) / 100; // Round to two decimal places
}

//routes
app.get('/', (req, res) => {
    res.render('index');
});

// Post request for conversion
app.post('/convert', (req, res) => {
    const { value, fromUnit, toUnit } = req.body;
    let result;

    if (fromUnit === toUnit) {
        result = "Cannot convert between the same units.";
    } else if (fromUnit === 'pounds' && toUnit === 'kg') {
        result = poundsToKg(value);
    } else if (fromUnit === 'kg' && toUnit === 'pounds') {
        result = kgToPounds(value);
    } else if (fromUnit === 'dollars' && toUnit === 'JD') {
        result = dollarsToJD(value);
    } else if (fromUnit === 'JD' && toUnit === 'dollars') {
        result = jdToDollars(value);
    } else {
        result = "Conversion not supported.";
    }

    res.render('result', { value, fromUnit, toUnit, result });
});

// Post request for shipping cost calculation
app.post('/calculate-shipping', (req, res) => {
    const { weight, unit } = req.body;
    const parsedWeight = parseFloat(weight);

    let convertedWeight;
    let currency;

    if (unit === 'kg') {
        convertedWeight = parsedWeight;
        currency = 'jd'; // Cost will be calculated in JD
    } else if (unit === 'pounds') {
        convertedWeight = poundsToKg(parsedWeight);
        currency = 'usd'; // Cost will be calculated in USD
    } else {
        res.send('Invalid unit selection.');
        return;
    }

    const shippingCost = calculateShippingCost(convertedWeight, currency);
    res.render('shipping-result', { weight: parsedWeight, unit, currency, shippingCost });
});

app.listen(process.env.PORT ||port, () => {
    console.log(`App listening on port ${port}`);
    console.log(`App listening on port ${process.env.PORT}`);
  });
