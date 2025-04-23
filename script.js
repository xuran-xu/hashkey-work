document.addEventListener('DOMContentLoaded', () => {
    console.log('Web3 Vocabulary App initialized');
    
    // DOM Elements
    const vocabularyGrid = document.getElementById('vocabularyGrid');
    const contentPanel = document.getElementById('contentPanel');
    const contentDisplay = document.getElementById('contentDisplay');
    const retractBtn = document.getElementById('retractBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const categorySelect = document.getElementById('categorySelect');
    
    // Check if DOM elements are found
    console.log('DOM elements found:', {
        vocabularyGrid: !!vocabularyGrid,
        contentPanel: !!contentPanel,
        categorySelect: !!categorySelect,
        searchInput: !!searchInput
    });
    
    // Variable to store vocabulary data
    let vocabularyData = [];
    
    // Load vocabulary data from JSON file
    async function loadVocabularyData() {
        try {
            console.log('Attempting to load vocabulary data from code.txt');
            const response = await fetch('code.txt');
            if (!response.ok) {
                throw new Error(`Failed to load vocabulary data: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Successfully loaded ${data.length} vocabulary items from code.txt`);
            vocabularyData = data;
        } catch (error) {
            console.error('Error loading vocabulary data:', error);
            console.log('Using fallback vocabulary data');
            
            // Use the vocab data already defined in the script
            if (!vocabularyData || vocabularyData.length === 0) {
                vocabularyData = window.fallbackVocabularyData || [];
            }
            
            console.log(`Using ${vocabularyData.length} vocabulary items from fallback data`);
        } finally {
            // Initialize Fuse.js for fuzzy search
            initializeFuseSearch();
            
            // Initialize the application with the data
            initializeApp();
        }
    }
    
    // Load Markdown content from file and convert to HTML
    async function loadMarkdownContent(path) {
        console.log(`Starting to load Markdown from: ${path}`);
        
        try {
            // Make sure we're using the correct relative path
            // For local development, we need to handle the path correctly
            let fetchPath = path;
            
            // Log the fetch attempt for debugging
            console.log(`Attempting to fetch from: ${fetchPath}`);
            window.debugLog && window.debugLog(`Attempting to fetch from: ${fetchPath}`);
            
            const response = await fetch(fetchPath);
            
            if (!response.ok) {
                const errorMessage = `HTTP error: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
            
            const markdown = await response.text();
            console.log(`Loaded Markdown content (first 100 chars): ${markdown.substring(0, 100)}...`);
            
            // Convert Markdown to HTML
            // Using marked.js or similar library
            if (window.marked) {
                console.log('Converting Markdown to HTML using marked.js');
                const html = marked.parse(markdown);
                return html;
            } else {
                console.log('No Markdown parser available, returning raw content');
                return `<pre>${markdown}</pre>`;
            }
        } catch (error) {
            console.error(`Error loading Markdown file (${path}):`, error);
            // Re-throw the error to let the caller handle it
            throw error;
        }
    }
    
    // Initialize Fuse.js for fuzzy search
    function initializeFuseSearch() {
        const fuseOptions = {
            keys: ['title', 'description'],
            threshold: 0.3,
            minMatchCharLength: 2
        };
        window.fuse = new Fuse(vocabularyData, fuseOptions);
    }
    
    // Initialize the application
    function initializeApp() {
        createVocabularyCards();
        setupEventListeners();
        // Apply initial filtering based on selected category
        const initialCategory = categorySelect.value;
        if (initialCategory !== 'all') {
            filterCards();
        }
        handleInitialHash();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener('input', handleSearch);
        clearSearchBtn.addEventListener('click', clearSearch);
        
        // Category filter - add explicit function to debug
        categorySelect.addEventListener('change', function() {
            console.log('Category changed to:', categorySelect.value);
            // For debugging, list all items and their types
            const typeCounts = {};
            vocabularyData.forEach(item => {
                typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
            });
            console.log('Type counts in data:', typeCounts);
            
            // Call filter function
            filterCards();
        });
        
        // Content panel controls
        retractBtn.addEventListener('click', hideContentPanel);
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);

        // Handle browser navigation
        window.addEventListener('popstate', handlePopState);
    }

    // Create vocabulary cards
    function createVocabularyCards() {
        vocabularyGrid.innerHTML = '';
        const selectedCategory = categorySelect.value;
        console.log('Creating cards for category:', selectedCategory);
        
        let cardCount = 0;
        
        vocabularyData.forEach((item, index) => {
            // Matching logic for category selection
            let matchesCategory;
            if (selectedCategory === 'all') {
                matchesCategory = true;
            } else if (selectedCategory === 'tech') {
                matchesCategory = item.type === 'tech' || item.type === '技术' || item.type === 'Technology';
            } else if (selectedCategory === 'finance') {
                matchesCategory = item.type === 'finance' || item.type === '金融';
            } else if (selectedCategory === 'wallet_identity') {
                matchesCategory = item.type === 'wallet_identity';
            } else if (selectedCategory === 'nft_metaverse') {
                matchesCategory = item.type === 'nft_metaverse' || item.type === 'NFT与游戏' || item.type === 'NFT与元宇宙';
            } else if (selectedCategory === 'governance') {
                matchesCategory = item.type === 'governance' || item.type === '治理';
            } else if (selectedCategory === 'other') {
                matchesCategory = item.type === 'other';
            } else {
                // For any other specific category
                matchesCategory = item.type === selectedCategory;
            }
            
            console.log(`Item ${item.id}: type=${item.type}, matchesCategory=${matchesCategory}`);
            
            if (matchesCategory) {
                const card = createVocabularyCard(item);
                vocabularyGrid.appendChild(card);
                cardCount++;
            }
        });

        console.log(`Created ${cardCount} cards`);
        
        // Show no results message if no cards are displayed
        if (cardCount === 0) {
            updateNoResultsMessage(false);
        } else {
            updateNoResultsMessage(true);
        }
    }

    // Create individual vocabulary card
    function createVocabularyCard(item) {
        const card = document.createElement('div');
        card.className = 'vocabulary-card fade-in';
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-type', item.type);
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${item.title}: ${item.description}`);
        
        // Upper layer with title - highlighted with primary color
        const upperLayer = document.createElement('div');
        upperLayer.className = 'card-upper-layer';
        upperLayer.textContent = item.title;
        
        // Lower layer with description - white background with subtle text
        const lowerLayer = document.createElement('div');
        lowerLayer.className = 'card-lower-layer';
        lowerLayer.textContent = item.description;
        
        card.appendChild(upperLayer);
        card.appendChild(lowerLayer);
        
        // Add event listeners
        card.addEventListener('click', () => showContentPanel(item.id));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showContentPanel(item.id);
            }
        });
        
        return card;
    }

    // Show content panel with details for the selected vocabulary item
    function showContentPanel(cardId) {
        const contentPanel = document.getElementById('contentPanel');
        const contentDisplay = document.getElementById('contentDisplay');
        const selectedItem = vocabularyData.find(item => item.id === cardId);
        
        if (!selectedItem) {
            console.error(`No vocabulary item found with id: ${cardId}`);
            return;
        }
        
        // Log the item details for debugging
        console.log('Selected vocabulary item:', selectedItem);
        
        // Mark the clicked card as last selected for focus management
        const selectedCard = document.querySelector(`.vocabulary-card[data-id="${cardId}"]`);
        if (selectedCard) {
            document.querySelectorAll('.vocabulary-card').forEach(card => {
                card.removeAttribute('data-last-selected');
            });
            selectedCard.setAttribute('data-last-selected', 'true');
        }
        
        // Show loading state
        contentDisplay.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading content...</p>
            </div>
        `;
        
        // Update panel title
        const contentHeader = document.querySelector('#contentPanel .content-header h2');
        if (contentHeader) {
            contentHeader.textContent = selectedItem.title;
        }
        
        // Determine if we should try to load content from a file or use inline content
        if (selectedItem.contentPath) {
            console.log(`Will attempt to load content from: ${selectedItem.contentPath}`);
            
            // Load and render Markdown directly
            loadMarkdownContent(selectedItem.contentPath)
                .then(html => {
                    contentDisplay.innerHTML = html;
                    
                    // Apply syntax highlighting if available
                    if (window.hljs) {
                        document.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightBlock(block);
                        });
                    }
                    
                    // Focus management
                    const retractBtn = document.getElementById('retractBtn');
                    if (retractBtn) {
                        retractBtn.focus();
                    }
                })
                .catch(error => {
                    // If we can't load from file, try to use inline content as fallback
                    if (selectedItem.content) {
                        console.log('Using fallback inline content due to loading error:', error);
                        contentDisplay.innerHTML = selectedItem.content;
                    } else {
                        // Enhanced error reporting
                        console.error('Detailed error loading content:', error);
                        contentDisplay.innerHTML = `
                            <div class="error-message">
                                <p>Sorry, there was an error loading the content: ${error.message}</p>
                                <p>Please try again later or contact support.</p>
                                <div class="technical-details">
                                    <p><strong>Technical Details:</strong></p>
                                    <pre>${error.stack || error.message}</pre>
                                    <p>Path attempted: ${selectedItem.contentPath}</p>
                                </div>
                            </div>
                        `;
                    }
                });
        } else if (selectedItem.content) {
            // Use inline content
            setTimeout(() => {
                contentDisplay.innerHTML = selectedItem.content;
                
                // Apply syntax highlighting if available
                if (window.hljs) {
                    document.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightBlock(block);
                    });
                }
                
                // Focus management
                const retractBtn = document.getElementById('retractBtn');
                if (retractBtn) {
                    retractBtn.focus();
                }
            }, 300);
        } else {
            // No content available
            contentDisplay.innerHTML = `
                <div class="notice">
                    <p>No detailed content available for this term.</p>
                </div>
            `;
        }
        
        // Add to browser history
        const url = new URL(window.location);
        url.hash = cardId;
        window.history.pushState({term: cardId}, '', url);
        
        // Show panel
        contentPanel.classList.add('show');
        document.body.classList.add('panel-active');
        document.body.style.overflow = 'hidden';
        
        // Announce to screen readers
        announceContentChange(selectedItem.title);
    }

    // Hide content panel
    function hideContentPanel() {
        const contentPanel = document.getElementById('contentPanel');
        contentPanel.classList.remove('show');
        document.body.classList.remove('panel-active');
        document.body.style.overflow = '';
        
        // Remove from URL
        const url = new URL(window.location);
        url.hash = '';
        window.history.pushState({}, '', url);
        
        // Restore focus to the last selected card
        const lastSelectedCard = document.querySelector('.vocabulary-card[data-last-selected="true"]');
        if (lastSelectedCard) {
            setTimeout(() => {
                lastSelectedCard.focus();
            }, 300);
        }
        
        // Announce to screen readers
        announceToScreenReader('Content panel closed');
    }

    // Handle search
    function handleSearch(e) {
        const searchTerm = e.target.value.trim();
        clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
        
        if (!searchTerm) {
            filterCards();
            return;
        }

        const results = window.fuse.search(searchTerm);
        const filteredIds = results.map(result => result.item.id);
        filterCards(filteredIds);
    }

    // Clear search
    function clearSearch() {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        filterCards();
        searchInput.focus();
    }

    // Filter cards by category and/or search results
    function filterCards(searchResults = null) {
        const selectedCategory = categorySelect.value;
        console.log('Filtering by category:', selectedCategory);
        
        // Clear the grid
        vocabularyGrid.innerHTML = '';
        let hasVisibleCards = false;
        let cardCount = 0;

        // Apply filters to each vocabulary item
        vocabularyData.forEach(item => {
            // Check category match based on selected value
            let matchesCategory = false;
            
            if (selectedCategory === 'all') {
                matchesCategory = true;
            } else {
                // Map of category values to possible type values in data
                const categoryMap = {
                    'tech': ['tech', '技术', 'Technology'],
                    'finance': ['finance', '金融'],
                    'wallet_identity': ['wallet_identity', '钱包与身份'],
                    'nft_metaverse': ['nft_metaverse', 'NFT与游戏', 'NFT与元宇宙'],
                    'governance': ['governance', '治理'],
                    'other': ['other', '其他']
                };
                
                // Check if the item's type is in the valid types array for the selected category
                if (categoryMap[selectedCategory]) {
                    matchesCategory = categoryMap[selectedCategory].includes(item.type);
                } else {
                    // Direct match for any other category
                    matchesCategory = item.type === selectedCategory;
                }
            }
            
            // Check if it matches search results (if any)
            const matchesSearch = !searchResults || searchResults.includes(item.id);
            
            // For debugging
            console.log(`Item ${item.id}: type=${item.type}, matchesCategory=${matchesCategory}, matchesSearch=${matchesSearch}`);
            
            // If it passes both filters, create and add the card
            if (matchesCategory && matchesSearch) {
                const card = createVocabularyCard(item);
                card.classList.add('fade-in');
                vocabularyGrid.appendChild(card);
                hasVisibleCards = true;
                cardCount++;
            }
        });

        console.log(`Displayed ${cardCount} cards after filtering`);

        // Update the category select UI to show it's active
        categorySelect.style.borderColor = selectedCategory !== 'all' ? 'var(--primary-color)' : '';
        
        // Show/hide no results message
        updateNoResultsMessage(hasVisibleCards);
        
        // Announce category change to screen readers
        if (selectedCategory !== 'all') {
            const categoryText = categorySelect.options[categorySelect.selectedIndex].text;
            announceToScreenReader(`Showing ${categoryText} category vocabulary`);
        }
    }

    // Update no results message
    function updateNoResultsMessage(hasVisibleCards) {
        let message = document.getElementById('noResultsMessage');
        
        if (!hasVisibleCards) {
            if (!message) {
                message = document.createElement('div');
                message.id = 'noResultsMessage';
                message.className = 'no-results fade-in';
                message.setAttribute('role', 'alert');
                message.textContent = 'No matching vocabulary found';
                vocabularyGrid.appendChild(message);
            } else {
                message.style.display = 'block';
            }
        } else if (message) {
            message.style.display = 'none';
        }
    }

    // Handle keyboard navigation
    function handleKeyboardNavigation(e) {
        if (e.key === 'Escape') {
            if (document.body.classList.contains('panel-active')) {
                hideContentPanel();
            }
        }
    }

    // Update active card state
    function updateActiveCard(activeId) {
        const cards = vocabularyGrid.querySelectorAll('.vocabulary-card');
        cards.forEach(card => {
            if (card.dataset.id === activeId) {
                card.classList.add('active');
                card.setAttribute('aria-expanded', 'true');
            } else {
                card.classList.remove('active');
                card.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Handle browser navigation
    function handlePopState(event) {
        const hash = window.location.hash.slice(1);
        if (hash) {
            showContentPanel(hash);
        } else {
            hideContentPanel();
        }
    }

    // Handle initial hash in URL
    function handleInitialHash() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            showContentPanel(hash);
        }
    }

    // Announce content changes to screen readers
    function announceContentChange(title) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `正在显示 ${title} 的详细内容`;
        
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    // Helper function for screen reader announcements
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    // Start loading vocabulary data
    loadVocabularyData();

    // Fallback data in case the external file doesn't load
    window.fallbackVocabularyData = [
        {
            id: 'blockchain',
            type: '技术',
            title: 'Blockchain',
            description: 'A distributed, immutable, and transparent digital ledger that records transactions across many computers.',
            contentPath: 'https://raw.githubusercontent.com/xuran-xu/hashkey-work/main/content/tech/blockchain.md'
        },
        {
            id: 'cryptography',
            type: '技术',
            title: 'Cryptography',
            description: 'The science of secure communication techniques that allow only the sender and intended recipient of a message to view its contents.',
            contentPath: 'https://raw.githubusercontent.com/xuran-xu/hashkey-work/main/content/tech/cryptography.md'
        },
        {
            id: 'smart_contract',
            type: '技术',
            title: 'Smart Contract',
            description: 'Self-executing contracts where the terms are directly written into code and automatically enforced.',
            content: `
                <h1>Smart Contract</h1>
                <p>Smart contracts are self-executing contracts where the terms are directly written into code and automatically enforced when predefined conditions are met. They run on blockchain networks, primarily Ethereum, and enable trustless, automated transactions without intermediaries.</p>
            `
        },
        {
            id: 'defi',
            type: '金融',
            title: 'DeFi',
            description: 'Decentralized Finance - financial applications built on blockchain technology that don\'t rely on traditional intermediaries.',
            content: `
                <h1>Decentralized Finance (DeFi)</h1>
                <p>DeFi refers to financial applications built on blockchain technology that don't rely on traditional intermediaries like banks or brokerages. Instead, they use smart contracts on blockchains like Ethereum to create protocols that can run autonomously.</p>
            `
        },
        {
            id: 'nft',
            type: 'NFT与元宇宙',
            title: 'NFT',
            description: 'Non-Fungible Token - a unique digital asset that represents ownership of real-world items like art, music, in-game items, and videos.',
            content: `
                <h1>Non-Fungible Tokens (NFTs)</h1>
                <p>NFTs are unique digital assets that represent ownership of real-world items like art, music, in-game items, and videos. Unlike cryptocurrencies such as Bitcoin, which are identical and interchangeable (fungible), each NFT has distinct properties and values.</p>
            `
        },
        {
            id: 'dao',
            type: '治理',
            title: 'DAO',
            description: 'Decentralized Autonomous Organization - an organization represented by rules encoded as a computer program, transparent and controlled by shareholders.',
            content: `
                <h1>Decentralized Autonomous Organization (DAO)</h1>
                <p>A DAO is an organization represented by rules encoded as a computer program that is transparent, controlled by organization members, and not influenced by a central authority. DAOs operate on blockchain technology and use governance tokens for voting and decision-making.</p>
            `
        },
        {
            id: 'wallet',
            type: '钱包与身份',
            title: 'Wallet',
            description: 'A tool that allows users to store, send, and receive cryptocurrency and manage their blockchain-based assets.',
            content: `
                <h1>Cryptocurrency Wallet</h1>
                <p>A cryptocurrency wallet is a digital tool that allows users to store, send, and receive cryptocurrency and manage their blockchain-based assets. Rather than storing actual coins or tokens, wallets store the private keys that prove ownership of digital assets on the blockchain.</p>
            `
        },
        {
            id: 'consensus',
            type: '技术',
            title: 'Consensus',
            description: 'The process by which a network of nodes reaches agreement on which transactions are legitimate and add them to the blockchain.',
            content: `
                <h1>Consensus Mechanisms</h1>
                <p>Consensus mechanisms are the processes by which a network of nodes reaches agreement on which transactions are legitimate and should be added to the blockchain. These protocols ensure that all nodes in the network agree on the state of the blockchain without needing to trust each other.</p>
            `
        },
        {
            id: 'mining',
            type: '技术',
            title: 'Mining',
            description: 'The process of validating transactions and adding them to a blockchain, often rewarded with cryptocurrency.',
            content: `
                <h1>Cryptocurrency Mining</h1>
                <p>Mining is the process of validating transactions and adding them to a blockchain through solving complex mathematical puzzles. Miners use powerful computers to compete in solving these puzzles, and successful miners are rewarded with newly minted cryptocurrency and transaction fees.</p>
            `
        },
        {
            id: 'tokenomics',
            type: '金融',
            title: 'Tokenomics',
            description: 'The subject of understanding the supply and demand characteristics of cryptocurrency tokens.',
            content: `
                <h1>Tokenomics</h1>
                <p>Tokenomics is the study of the economics of cryptocurrencies and tokens. It encompasses the factors that influence a token's value, including supply mechanisms, distribution methods, inflation rates, utility, incentive structures, and governance models.</p>
            `
        }
    ];
});