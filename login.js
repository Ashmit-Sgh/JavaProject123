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
            }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                grid: { display: false },
            },
            y: {
                ticks: { display: false },
                border: { display: false, dash: [5, 5] }
            }
        },
        plugins: {
            legend: { display: false }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuad',
        }
    }
});

const symbolInput = document.querySelector('#symbol');
const stockList = document.querySelector('#stock-list');

// Show loading indicator
function showLoading() {
    stockList.innerHTML = '<li class="loading">Loading...</li>';
}

// Function to fetch stock data for multiple symbols
function fetchTopStocks() {
    const topStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX', 'NVDA', 'BRK.B', 'JNJ'];
    const requests = topStocks.map(symbol =>
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`)
    );

    Promise.all(requests)
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(dataArray => {
            let html = '<div class="stock-bubbles">'; // Add class for styling
            dataArray.forEach((data, index) => {
                const symbol = topStocks[index];
                if (data.c) {
                    const changePercent = ((data.d / data.pc) * 100).toFixed(2); // Calculate change percentage
                    const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
                    html += `
                    <div class="stock-bubble" style="background-color: ${changeColor === 'green' ? '#d4edda' : '#f8d7da'};">
                        <span class="stock-symbol">${symbol}</span>
                        <span class="stock-price">Price: $${data.c.toFixed(2)}</span>
                        <span class="stock-change" style="color: ${changeColor}">${changePercent}%</span>
                    </div>`;
                } else {
                    html += `<div class="error">Invalid Symbol: ${symbol}</div>`;
                }
            });
            html += '</div>'; // Close the bubbles container
            stockList.innerHTML = html; // Update stock list container
        })
        .catch(error => {
            console.error(error);
            stockList.innerHTML = '<li class="error">Failed to fetch stock data.</li>';
        });
}

// Function to fetch and display stock data for the searched symbol
function fetchStockData(symbol) {
    showLoading();
    if (!symbol) {
        fetchTopStocks(); // Display top stocks if input is empty
        return;
    }

    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`)
        .then(response => response.json())
        .then(data => {
            if (data.c) {
                const changePercent = ((data.d / data.pc) * 100).toFixed(2); // Calculate change percentage
                const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
                stockList.innerHTML = `
                <div class="stock-bubble" style="background-color: ${changeColor === 'green' ? '#d4edda' : '#f8d7da'};">
                    <span class="stock-symbol">${symbol}</span>
                    <span class="stock-price">Price: $${data.c.toFixed(2)}</span>
                    <span class="stock-change" style="color: ${changeColor}">${changePercent}%</span>
                </div>`;
            } else {
                stockList.innerHTML = '<li class="error">Invalid Symbol</li>';
            }
        })
        .catch(error => {
            console.error(error);
            stockList.innerHTML = '<li class="error">Failed to fetch stock data.</li>';
        });
}

// Display top stocks on page load
fetchTopStocks();

// Handle form submission
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const symbol = symbolInput.value.toUpperCase();
    fetchStockData(symbol);
});
