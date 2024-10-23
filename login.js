
const ctx2 = document.querySelector('.prog-chart');



new Chart(ctx2, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
            label: 'REVENUE ',
            data: [6, 10, 8, 14, 6, 7, 4],
            borderColor: '#0891b2',
            tension: 0.4
        },
        {
            label: 'EXPENSE',
            data: [8, 6, 7, 6, 11, 8, 10],
            borderColor: '#ca8a04',
            tension: 0.4
        }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                grid: {
                    display: false,
                }
            },
            y: {
                ticks: {
                    display: false
                },
                border: {
                    display: false,
                    dash: [5, 5]
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuad',
        }
    }
});
const symbolInput = document.querySelector('#symbol');
const stockList = document.querySelector('#stock-list');

// Function to fetch and display the top 10 stocks
function fetchTopStocks() {
    // Fetch data from api
    fetch('https://www.alphavantage.co/query?function=SECTOR&apikey=D9P414FI6YRNEDBZ').then(response => response.json()).then(data => {
        const stocks = data['Rank A: Real-Time Performance'];
        let html = '';
        // Loop through the stocks and generate html for each stock
        for (let i = 0; i < 10; i++) {
            const symbol = Object.keys(stocks)[i];
            const change = stocks[symbol];
            const changeColor = parseFloat(change) >= 0 ? 'green' : 'red';
            html += `
            <li>
                <span class="symbol">${symbol}</span>
                <span class="change" style="color: ${changeColor}">${change}</span>
            </li>    
            `;
        }

        // Update stock list container
        stockList.innerHTML = html;
    }).catch(error => console.error(error));
}

// Function to fetch and display stock data for the searched symbol
function fetchStockData(symbol) {
    // If input was empty display top 10 stocks
    if (!symbol) {
        fetchTopStocks();
        return;
    }

    // Fetch the stock data for the provided symbol from api
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=D9P414FI6YRNEDBZ`).then(response => response.json()).then(data => {
        const quote = data['Global Quote'];
        if (quote && quote['10. change percent']) {
            const changePercent = quote['10. change percent'].replace('%', '');
            const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
            const html = `<li>
            <span class="symbol">${symbol}</span>
            <span class="change" style="color: ${changeColor}">${changePercent}</span>
        </li>    
        `;
            stockList.innerHTML = html;
        } else {
            stockList.innerHTML = '<li class="error">Invalid Symbol</li>';
        }
    }).catch(error => console.error(error));

}

// Display top 10 on page load
fetchTopStocks();

// Handle from submission
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Get symbol entered by user and convert it to uppercase
    const symbol = symbolInput.value.toUpperCase();
    fetchStockData(symbol);
});