async function fetchBasicFinancials(symbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`);
        const data = await response.json();

        if (data.metric) {
            const financialDataContainer = document.getElementById('financial-data-container');
            financialDataContainer.innerHTML = ''; // Clear previous data

            const metrics = [
                { name: 'Market Cap', value: formatMarketCap(data.metric.marketCapitalization * 1000000) },
                { name: 'P/E Ratio', value: data.metric.peBasicExclExtraTTM?.toFixed(2) || 'N/A' },
                { name: '52W High', value: formatNumber(data.metric['52WeekHigh']) },
                { name: '52W Low', value: formatNumber(data.metric['52WeekLow']) },
                { name: 'Revenue', value: formatMarketCap(data.metric.revenuePerShareTTM * data.metric.marketCapitalization) },
                { name: 'Gross Profit', value: formatMarketCap(data.metric.grossMarginTTM * data.metric.revenuePerShareTTM * data.metric.marketCapitalization / 100) },
                
            ];

            metrics.forEach(metric => {
                const box = document.createElement('div');
                box.className = 'financial-box';
                box.innerHTML = `
                    <h3>${metric.name}</h3>
                    <p>${metric.value}</p>
                `;
                financialDataContainer.appendChild(box);
            });

            financialDataContainer.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error fetching basic financials:', error);
        document.getElementById('financial-data-container').innerHTML = '<p class="error">Failed to fetch financial data.</p>';
    }
}

// Helper functions (add these if not already present)
function formatMarketCap(value) {
    return `$${(value / 1000000000).toFixed(2)}B`;
}

function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(value);
}

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
            let html = '<div class="stock-bubbles">';
            dataArray.forEach((data, index) => {
                const symbol = topStocks[index];
                if (data.c) {
                    const changePercent = ((data.d / data.pc) * 100).toFixed(2);
                    const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
                    html += `
                    <div class="stock-bubble" style="background-color: ${changeColor === 'green' ? '#d4edda' : '#f8d7da'};">
                        <span class ="stock-symbol">${symbol}</span>
                        <span class="stock-price">Price: $${data.c.toFixed(2)}</span>
                        <span class="stock-change" style="color: ${changeColor}">${changePercent}%</span>
                    </div>
                    `;
                } else {
                    html += `<div class="error">Invalid Symbol: ${symbol}</div>`;
                }
            });
            html += '</div>';
            stockList.innerHTML = html;
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
        fetchTopStocks();
        return;
    }

    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`)
        .then(response => response.json())
        .then(data => {
            if (data.c) {
                const changePercent = ((data.d / data.pc) * 100).toFixed(2);
                const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
                stockList.innerHTML = `
                <div class="stock-bubble" style="background-color: ${changeColor === 'green' ? '#d4edda' : '#f8d7da'};">
                    <span class="stock-symbol">${symbol}</span>
                    <span class="stock-price">Price: $${data.c.toFixed(2)}</span>
                    <span class="stock-change" style="color: ${changeColor}">${changePercent}%</span>
                </div>
                `;
            } else {
                stockList.innerHTML = '<li class="error">Invalid Symbol</li>';
            }
        })
        .catch(error => {
            console.error(error);
            stockList.innerHTML = '<li class="error">Failed to fetch stock data.</li>';
        });
    fetchBasicFinancials(symbol);
}

// Display top stocks on page load
fetchTopStocks();

// Handle form submission
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const symbol = symbolInput.value.toUpperCase();
    fetchStockData(symbol);
    symbolInput.value = '';
});

// Function to fetch and display market status
function updateMarketStatus() {
    const marketStatusElement = document.getElementById('marketStatus');
    const currentTimeElement = document.getElementById('currentTime');

    // Create date object for ET (US Eastern Time)
    const etOptions = {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    };

    // Get current ET time
    const etTime = new Intl.DateTimeFormat('en-US', etOptions).format(new Date());
    currentTimeElement.textContent = etTime;

    // Parse the time for market hours check
    const now = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
    const etDate = new Date(now);

    const day = etDate.getDay();
    const hour = etDate.getHours();
    const minute = etDate.getMinutes();
    const currentTimeNumber = hour * 100 + minute;

    // Market is open Monday (1) through Friday (5)
    // Between 9:30 AM (930) and 4:00 PM (1600)
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = currentTimeNumber >= 930 && currentTimeNumber <= 1600;

    if (isWeekday && isMarketHours) {
        marketStatusElement.textContent = 'Open';
        marketStatusElement.style.color = 'green';
    } else {
        marketStatusElement.textContent = 'Closed';
        marketStatusElement.style.color = 'red';
    }
}

// Update immediately when page loads
updateMarketStatus();

// Update every second
setInterval(updateMarketStatus, 1000);

// Function to fetch and display market news
async function fetchMarketNews() {
    const apiKey = 'cscchthr01qgt32f7m1gcscchthr01qgt32f7m20';
    const newsContainer = document.getElementById('news-container');

    try {
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${apiKey}`);
        const data = await response.json();

        // Clear existing news
        newsContainer.innerHTML = '';

        // Display only the first 5 news items
        data.slice(0, 5).forEach(news => {
            const date = new Date(news.datetime * 1000);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';
            newsElement.innerHTML = `
                <h5>${news.headline}</h5>
                <div class="news-meta">
                    <span class="news-source">${news.source}</span>
                    <span class="news-date">${formattedDate}</span>
                </div>
                ${news.image ? `<div class="news-content">
                    <img src="${news.image}" alt="News Image" class="news-image">
                    <div class="news-summary">${news.summary}</div>
                </div>` : `<div class="news-summary">${news.summary}</div>`}
                <a href="${news.url}" target="_blank" class="news-link">Read more</a>
            `;

            newsContainer.appendChild(newsElement);
        });
    } catch (error) {
        console.error('Error fetching market news:', error);
        newsContainer.innerHTML = '<p class="news-error">Error loading market news</p>';
    }
}

// Fetch news when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchMarketNews();
    // Refresh news every 5 minutes
    setInterval(fetchMarketNews, 300000);
});

// Function to fetch and update NASDAQ 100 data
function updateNASDAQ100() {
    const nasdaqSymbol = 'NDX'; // NASDAQ 100 symbol
    const apiKey = 'cscchthr01qgt32f7m1gcscchthr01qgt32f7m20'; // Replace with your actual API key

    console.log('Fetching NASDAQ 100 data...');

    fetch(`https://finnhub.io/api/v1/quote?symbol=${nasdaqSymbol}&token=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data.c) {
                const priceElement = document.getElementById('nasdaq-price');
                const changeElement = document.getElementById('nasdaq-change');

                // Update price
                priceElement.textContent = `$${data.c.toFixed(2)}`;

                // Calculate and update percentage change
                const changePercent = ((data.d / data.pc) * 100).toFixed(2);
                changeElement.textContent = `${changePercent}%`;

                // Update color based on change
                if (parseFloat(changePercent) >= 0) {
                    changeElement.style.color = 'green';
                } else {
                    changeElement.style.color = 'red';
                }

                console.log('NASDAQ 100 data updated successfully');
            } else {
                console.error('Unexpected data structure:', data);
                document.getElementById('nasdaq-price').textContent = 'Data Error';
                document.getElementById('nasdaq-change').textContent = 'N/A';
            }
        })
        .catch(error => {
            console.error('Error fetching NASDAQ 100 data:', error);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            document.getElementById('nasdaq-price').textContent = 'Fetch Error';
            document.getElementById('nasdaq-change').textContent = 'N/A';
        });
}

// Update NASDAQ 100 data when page loads
updateNASDAQ100();

// Update NASDAQ 100 data every minute
setInterval(() => {
    console.log('Updating NASDAQ 100 data');
    updateNASDAQ100();
}, 60000);

// Optional: Add this to check if the script is running
console.log('NASDAQ 100 update script loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Remove news container from initial animation setup
    gsap.set(['.item', '#stock-list', '.prog-chart'], {
        autoAlpha: 0
    });

    // Create initial loading animation
    const loadingTl = gsap.timeline();

    // Add a loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    document.body.appendChild(overlay);

    // Add this CSS
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .loading-text {
            color: white;
            font-size: 2rem;
            font-weight: bold;
            opacity: 0;
        }
        
        .visible {
            visibility: visible !important;
        }
    `;
    document.head.appendChild(style);

    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'Loading Dashboard...';
    overlay.appendChild(loadingText);

    // Main animation timeline
    const mainTl = gsap.timeline({
        defaults: { ease: "power3.out" }
    });

    // Loading sequence
    loadingTl
        .to(loadingText, {
            opacity: 1,
            duration: 0.5
        })
        .to(loadingText, {
            opacity: 0,
            duration: 0.5,
            delay: 0.5
        })
        .to(overlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                overlay.remove();
                // Make elements visible before animation
                gsap.set(['.item', '#stock-list', '.prog-chart'], {
                    visibility: 'visible'
                });
                // Start main animations
                mainTl.play();
            }
        });

    // Main animations (excluding news)
    mainTl
        .pause()
        .to('.item', {
            duration: 0.8,
            autoAlpha: 1,
            y: 0,
            rotationX: 0,
            transformOrigin: "0% 50% -50",
            stagger: 0.2,
            ease: "back.out(1.7)",
            clearProps: "transform"
        })
        .to('#stock-list', {
            duration: 1,
            autoAlpha: 1,
            scale: 1,
            x: 0,
            ease: "elastic.out(1, 0.8)",
            clearProps: "transform"
        }, "-=0.4")
        .to('.prog-chart', {
            duration: 1.2,
            autoAlpha: 1,
            scale: 1,
            y: 0,
            ease: "power4.out",
            clearProps: "transform"
        }, "-=0.6");

    // Add hover animations for interactive elements
    gsap.utils.toArray('.item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.02,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)"
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "none"
            });
        });
    });
});
