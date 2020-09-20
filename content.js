search_endpoint = "https://tz52nf4jt5.execute-api.us-west-2.amazonaws.com/prod/search_web"
product_endpoint = "https://1084cx35m6.execute-api.us-west-2.amazonaws.com/dev/product/{pid}/review_string"
var product;
var page_title = document.getElementsByTagName('title')[0].text
data = { query: page_title }

function fetchData() {
    fetch(search_endpoint, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST", 
        body: JSON.stringify(data)
        }).then(res => {
            return res.json()
        }).then(data => {
            var productId = data.searchResults[0].nodeId
            var product = data._nodes.products[productId]
            chrome.runtime.sendMessage({message:'product_data', product})
            fetch(product_endpoint.replace('{pid}', productId), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "GET"
            }).then(res => {
                return res.json()
            }).then(data => {
                var review_data = data.review_data
                chrome.runtime.sendMessage({message:'product_data', product})
                chrome.runtime.sendMessage({message:'product_review_data', review_data})
            })
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.message === "fetch_product_data"){
            fetchData();
        }
    }
)