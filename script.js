const API_BASE_URL = 'https://mil.psy.ntu.edu.tw:5000';

// 工具函數
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = `
        <strong>錯誤:</strong> ${message}
        <button onclick="this.parentElement.classList.add('hidden')" class="float-right text-red-800 font-bold">
            <i class="fas fa-times"></i>
        </button>
    `;
    errorDiv.classList.remove('hidden');
}

function clearResults() {
    document.getElementById('results').innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-blue-800 mb-4">
                <i class="fas fa-info-circle mr-2"></i>
                Tren's Backend API 前端介面
            </h3>
            <div class="space-y-3 text-blue-700">
                <p><strong>伺服器:</strong> ${API_BASE_URL}</p>
                <p><strong>可用端點:</strong></p>
                <ul class="list-disc list-inside ml-4">
                    <li><code>/terms</code> - 所有可用術語</li>
                    <li><code>/terms/&lt;term&gt;</code> - 特定術語的關聯</li>
                    <li><code>/query/&lt;query_string&gt;/studies</code> - 邏輯搜尋研究</li>
                </ul>
            </div>
        </div>
    `;
    document.getElementById('error').classList.add('hidden');
}

function createResultCard(title, content, type = 'info') {
    const bgColors = {
        info: 'bg-white',
        success: 'bg-green-50',
        warning: 'bg-yellow-50',
        error: 'bg-red-50'
    };

    const borderColors = {
        info: 'border-gray-200',
        success: 'border-green-200',
        warning: 'border-yellow-200',
        error: 'border-red-200'
    };

    const icons = {
        info: 'fa-info-circle text-blue-600',
        success: 'fa-check-circle text-green-600', 
        warning: 'fa-exclamation-triangle text-yellow-600',
        error: 'fa-times-circle text-red-600'
    };

    return `
        <div class="${bgColors[type]} border ${borderColors[type]} rounded-lg shadow-sm p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <i class="fas ${icons[type]} mr-2"></i>
                ${title}
            </h3>
            <div class="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <pre class="text-sm text-gray-800 whitespace-pre-wrap">${content}</pre>
            </div>
        </div>
    `;
}

// API 呼叫函數
async function loadAllTerms() {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/terms`);
        const info = `請求: GET ${API_BASE_URL}/terms\n狀態: ${response.status} ${response.statusText}`;
        
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }
        
        const data = await response.json();
        hideLoading();
        
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = createResultCard(
            'GET /terms - 所有可用術語',
            `${info}\n\n回應資料:\n${JSON.stringify(data, null, 2)}`,
            'success'
        );
        
    } catch (error) {
        hideLoading();
        showError(`無法取得術語列表: ${error.message}`);
    }
}

async function searchTerm(term = null) {
    const termToSearch = term || document.getElementById('termInput').value.trim();
    
    if (!termToSearch) {
        showError('請輸入要搜尋的術語');
        return;
    }
    
    showLoading();
    
    try {
        const url = `${API_BASE_URL}/terms/${encodeURIComponent(termToSearch)}`;
        const response = await fetch(url);
        const info = `請求: GET ${url}\n狀態: ${response.status} ${response.statusText}`;
        
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }
        
        const data = await response.json();
        hideLoading();
        
        const resultsDiv = document.getElementById('results');
        if (Object.keys(data).length === 0) {
            resultsDiv.innerHTML = createResultCard(
                `GET /terms/${termToSearch} - 術語搜尋`,
                `${info}\n\n回應資料: 找不到相關的術語關聯`,
                'warning'
            );
        } else {
            resultsDiv.innerHTML = createResultCard(
                `GET /terms/${termToSearch} - 術語搜尋`,
                `${info}\n\n回應資料:\n${JSON.stringify(data, null, 2)}`,
                'success'
            );
        }
        
    } catch (error) {
        hideLoading();
        showError(`搜尋術語時發生錯誤: ${error.message}`);
    }
}

async function searchQuery(query = null) {
    const queryToSearch = query || document.getElementById('queryInput').value.trim();
    
    if (!queryToSearch) {
        showError('請輸入查詢條件');
        return;
    }
    
    showLoading();
    
    try {
        const encodedQuery = encodeURIComponent(queryToSearch);
        const url = `${API_BASE_URL}/query/${encodedQuery}/studies`;
        const response = await fetch(url);
        const info = `請求: GET ${url}\n狀態: ${response.status} ${response.statusText}`;
        
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }
        
        const data = await response.json();
        hideLoading();
        
        const resultsDiv = document.getElementById('results');
        if (Object.keys(data).length === 0 || data.count === 0) {
            resultsDiv.innerHTML = createResultCard(
                `GET /query/${queryToSearch}/studies - 邏輯搜尋`,
                `${info}\n\n回應資料: 找不到符合條件的研究`,
                'warning'
            );
        } else {
            resultsDiv.innerHTML = createResultCard(
                `GET /query/${queryToSearch}/studies - 邏輯搜尋`,
                `${info}\n\n找到 ${data.count} 筆研究\n\n回應資料:\n${JSON.stringify(data, null, 2)}`,
                'success'
            );
        }
        
    } catch (error) {
        hideLoading();
        showError(`搜尋研究時發生錯誤: ${error.message}`);
    }
}

// 測試函數
function testTermSearch() {
    document.getElementById('termInput').value = 'amygdala';
    searchTerm('amygdala');
}

function testQuerySearch() {
    document.getElementById('queryInput').value = 'amygdala not emotion';
    searchQuery('amygdala not emotion');
}

async function runAllTests() {
    showLoading();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<div class="text-center py-4">執行測試中...</div>';
    
    let allResults = '';
    
    try {
        // 測試 /terms
        const termsResponse = await fetch(`${API_BASE_URL}/terms`);
        allResults += createResultCard(
            '測試 1: GET /terms',
            `請求: GET ${API_BASE_URL}/terms\n狀態: ${termsResponse.status} ${termsResponse.statusText}\n\n回應: 成功取得所有術語`,
            'success'
        );
        
        // 測試 /terms/amygdala
        const termResponse = await fetch(`${API_BASE_URL}/terms/amygdala`);
        allResults += createResultCard(
            '測試 2: GET /terms/amygdala',
            `請求: GET ${API_BASE_URL}/terms/amygdala\n狀態: ${termResponse.status} ${termResponse.statusText}\n\n回應: 成功取得 amygdala 相關術語`,
            'success'
        );
        
        // 測試 /query/amygdala%20not%20emotion/studies
        const queryResponse = await fetch(`${API_BASE_URL}/query/amygdala%20not%20emotion/studies`);
        const queryData = await queryResponse.json();
        allResults += createResultCard(
            '測試 3: GET /query/amygdala%20not%20emotion/studies',
            `請求: GET ${API_BASE_URL}/query/amygdala%20not%20emotion/studies\n狀態: ${queryResponse.status} ${queryResponse.statusText}\n\n找到 ${queryData.count} 筆研究\n回應: 成功執行邏輯搜尋`,
            'success'
        );
        
        hideLoading();
        resultsDiv.innerHTML = allResults;
        
    } catch (error) {
        hideLoading();
        showError(`測試過程中發生錯誤: ${error.message}`);
    }
}

// 事件監聽器
document.addEventListener('DOMContentLoaded', function() {
    const termInput = document.getElementById('termInput');
    const queryInput = document.getElementById('queryInput');
    
    termInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTerm();
        }
    });
    
    queryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchQuery();
        }
    });
});