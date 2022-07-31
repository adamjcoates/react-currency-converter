import { useEffect, useState } from 'react';
import './App.css';
import CurrencyRow from "./CurrencyRow";
import { config } from "./config";

const BASE_URL = "https://api.apilayer.com/exchangerates_data/latest";

const headers = new Headers();
headers.append("apikey", config.SECRET_KEY);

const requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: headers,
};

function App() {
  /*
    Return: array[0]: current options, array[1]: function to set those options
  */
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [fromCurrency, setFromCurrency] = useState();
  const [toCurrency, setToCurrency] = useState();
  const [exchangeRate, setExchangeRate] = useState();
  const [amount, setAmount] = useState(1);
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true);

  let toAmount, fromAmount
  if (amountInFromCurrency) {
    fromAmount = amount;
    toAmount = amount * exchangeRate;
  } else {
    toAmount = amount;
    fromAmount = amount / exchangeRate;
  }

  /* 
    Params: function, array
    Desc: Whenever items in the array change, rerun the useEffect()
    Current 1st use case: Pass an empty array that won't change, therefore, useEffect()
    will only be called ONCE on app load
    Current 2nd use case: If fromCurrency or toCurrency ever change, 
  */
  useEffect(() => {
    fetch(BASE_URL, requestOptions)
      .then(res => res.json())
      .then(data => {
        const firstCurrency = Object.keys(data.rates)[0];
        setCurrencyOptions([...Object.keys(data.rates)]);
        setFromCurrency(data.base);
        setToCurrency(firstCurrency);
        setExchangeRate(data.rates[firstCurrency]);
      });
  }, [])

  useEffect(() => {
    if (fromCurrency != null && toCurrency != null) {
      fetch(`${BASE_URL}?base${fromCurrency}&symbols=${toCurrency}`, requestOptions)
      .then(res => res.json())
      .then(data => setExchangeRate(data.rates[toCurrency]));
    }
  }, [fromCurrency, toCurrency])

  function handleFromAmountChange(e) {
    setAmount(e.target.value);
    setAmountInFromCurrency(true);
  }

  function handleToAmountChange(e) {
    setAmount(e.target.value);
    setAmountInFromCurrency(false);
  }

  return (
    <>
      <h1>Currency Converter</h1>
      <CurrencyRow 
        currencyOptions={currencyOptions}
        selectedCurrency={fromCurrency}
        onChangeCurrency={e => setFromCurrency(e.target.value)}
        onChangeAmount={handleFromAmountChange}
        amount={fromAmount}
      />
      <div className="equals">=</div>
      <CurrencyRow 
        currencyOptions={currencyOptions}
        selectedCurrency={toCurrency}
        onChangeCurrency={e => setToCurrency(e.target.value)}
        onChangeAmount={handleToAmountChange}
        amount={toAmount}
      />
    </>
   
  );
}

export default App;
