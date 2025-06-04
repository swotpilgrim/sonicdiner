class SonicDiner {
    constructor() {
        this.menus = {};
        this.currentPath = [];
        this.menuFiles = [
            'ruby_diner.json',
            'morticia_diner.json',
            'atomic_automat.json',
            'millennium_cafe.json',
            'terminal_underground.json',
            'gordons_steakhouse.json',
            'california_surf.json',
            'soviet_brutalist.json',
            'miami_vice.json',
            'disco_fever.json',
            'japanese_bubble.json',
            'studio_54.json'
        ];
    }

    async init() {
        await this.loadMenus();
        this.setupHomeClick();
        this.showMenus();
    }

    setupHomeClick() {
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => this.showMenus());
        }
    }

    async loadMenus() {
        for (const menuFile of this.menuFiles) {
            try {
                const response = await fetch(menuFile);
                const menuData = await response.json();
                this.menus[menuData.id] = menuData;
            } catch (error) {
                console.error(`Error loading ${menuFile}:`, error);
            }
        }
    }

    showMenus() {
        this.currentPath = [];
        this.updateBreadcrumb();
        this.updateNavigation();
        
        const grid = document.getElementById('contentGrid');
        grid.innerHTML = '';
        
        Object.values(this.menus).forEach(menu => {
            const card = this.createCard(menu.title, menu.description, '', () => this.showCategories(menu.id));
            grid.appendChild(card);
        });
        
        document.getElementById('backButton').classList.add('hidden');
    }

    showCategories(menuId) {
        this.currentPath = [menuId];
        this.updateBreadcrumb();
        this.updateNavigation();
        
        const grid = document.getElementById('contentGrid');
        grid.innerHTML = '';
        
        const menu = this.menus[menuId];
        Object.entries(menu.categories).forEach(([categoryId, category]) => {
            const card = this.createCard(category.title, category.description, '', () => this.showItems(menuId, categoryId));
            grid.appendChild(card);
        });
        
        document.getElementById('backButton').classList.add('hidden');
    }

    showItems(menuId, categoryId) {
        this.currentPath = [menuId, categoryId];
        this.updateBreadcrumb();
        this.updateNavigation();
        
        const grid = document.getElementById('contentGrid');
        grid.innerHTML = '';
        
        const category = this.menus[menuId].categories[categoryId];
        Object.entries(category.items).forEach(([itemId, item]) => {
            const card = this.createCard(item.title, item.description, item.samples, () => this.generatePlaylist(menuId, categoryId, itemId));
            grid.appendChild(card);
        });
        
        document.getElementById('backButton').classList.add('hidden');
    }

    createCard(title, description, samples, onClick) {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.onclick = onClick;
        
        let samplesHtml = '';
        if (samples) {
            samplesHtml = `
                <div class="sample-tracks">
                    <h4>Sample Tracks:</h4>
                    <em>${samples}</em>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="menu-title">${title}</div>
            <div class="menu-description">${description}</div>
            ${samplesHtml}
        `;
        
        return card;
    }

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        
        if (this.currentPath.length === 0) {
            breadcrumb.innerHTML = '<div class="breadcrumb-nav">SELECT <span>MENU</span></div>';
        } else if (this.currentPath.length === 1) {
            const menu = this.menus[this.currentPath[0]];
            breadcrumb.innerHTML = `
                <div class="breadcrumb-nav">
                    <span class="breadcrumb-link" onclick="app.showMenus()">HOME</span> // 
                    <span class="breadcrumb-current">${menu.title}</span> // 
                    SELECT <span>CATEGORY</span>
                </div>
                <div class="diner-description">${menu.description}</div>
            `;
        } else if (this.currentPath.length === 2) {
            const menu = this.menus[this.currentPath[0]];
            const category = menu.categories[this.currentPath[1]];
            breadcrumb.innerHTML = `
                <div class="breadcrumb-nav">
                    <span class="breadcrumb-link" onclick="app.showMenus()">HOME</span> // 
                    <span class="breadcrumb-link" onclick="app.showCategories('${this.currentPath[0]}')">${menu.title}</span> // 
                    <span class="breadcrumb-current">${category.title}</span> // 
                    SELECT <span>ITEM</span>
                </div>
            `;
        }
    }

    updateNavigation() {
        // Clear everything
        document.getElementById('menuNav').innerHTML = '';
        document.getElementById('categoryNav').innerHTML = '';
        document.getElementById('itemNav').innerHTML = '';

        // Get all menus
        const menus = Object.values(this.menus);
        
        // Create the navigation container
        const navigationContainer = document.createElement('div');
        navigationContainer.className = 'nav-container';
        
        // Create items container that fills the nav bar
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'nav-items-container collapsed';
        
        // Add all menu items
        menus.forEach(menu => {
            const navItem = document.createElement('div');
            navItem.className = `nav-item ${this.currentPath[0] === menu.id ? 'active' : ''}`;
            navItem.textContent = menu.title;
            navItem.onclick = () => this.showCategories(menu.id);
            itemsContainer.appendChild(navItem);
        });
        
        navigationContainer.appendChild(itemsContainer);
        document.getElementById('menuNav').appendChild(navigationContainer);
        
        // Create separate toggle button below nav
        this.createToggleButton(itemsContainer);

        // Hide other nav levels
        const categoryNav = document.getElementById('categoryNav').parentElement;
        const itemNav = document.getElementById('itemNav').parentElement;
        if (categoryNav) categoryNav.style.display = 'none';
        if (itemNav) itemNav.style.display = 'none';
    }

    createToggleButton(itemsContainer) {
        // Remove existing toggle button
        const existingToggle = document.querySelector('.nav-toggle-container');
        if (existingToggle) existingToggle.remove();
        
        // Create toggle button container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'nav-toggle-container';
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'nav-toggle-btn';
        toggleButton.innerHTML = 'More ▼';
        
        let isExpanded = false;
        toggleButton.onclick = () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                itemsContainer.className = 'nav-items-container expanded';
                toggleButton.innerHTML = 'Less ▲';
            } else {
                itemsContainer.className = 'nav-items-container collapsed';
                toggleButton.innerHTML = 'More ▼';
            }
        };
        
        toggleContainer.appendChild(toggleButton);
        
        // Insert after navigation
        const navigation = document.querySelector('.navigation');
        navigation.parentNode.insertBefore(toggleContainer, navigation.nextSibling);
    }

    generatePlaylist(menuId, categoryId, itemId) {
        const item = this.menus[menuId].categories[categoryId].items[itemId];
        const menu = this.menus[menuId];
        
        const prompt = this.createAIPrompt(menu, item);
        this.showPromptModal(item.title, prompt);
    }

createAIPrompt(menu, item) {
    const prompt = `Create a playlist for "${item.title}" based on this aesthetic description:

**Theme:** ${menu.title}
**Overall Vibe:** ${menu.description}

**Playlist Concept:** ${item.title}
**Description:** ${item.description}

**Sample Reference Tracks:** ${item.samples}
*NOTE: These are for aesthetic inspiration only - DO NOT include any of these reference tracks in your playlist*

## CREATIVE CONSTRAINTS & REQUIREMENTS

**Aesthetic Archaeology:** You are a cultural detective. This playlist must capture the EXACT sensory experience, time period, and social context described. Think about:
- What would actually be playing in this specific environment?
- What regional/subcultural music scenes connect to this aesthetic?
- What songs capture the *feeling* rather than just the *topic*?

**Forbidden Territory:**
- NO reference tracks from the sample list above
- NO obvious compilation album choices ("Classic Rock Road Trip," "80s Hits," etc.)
- NO repeating artists within the same playlist
- NO generic songs that could work for any similar theme
- NO more than 2 songs that most people would immediately recognize

**Required Diversity:**
- Include at least 3 deep cuts or lesser-known tracks
- Span multiple decades while maintaining aesthetic coherence
- Include at least 2 songs from different genres that somehow fit the vibe
- Include at least 1 instrumental track that captures the mood

**Sensory Specificity:**
- Every song must sound like it belongs in the EXACT environment described
- Consider: lighting, time of day, social dynamics, economic conditions, technology level
- Think about what the people in this space would ACTUALLY listen to, not what sounds thematically appropriate

**Cultural Context:**
- Consider the specific subcultures, regions, and time periods involved
- Research actual music scenes that would connect to this aesthetic
- Think about how music consumption worked in this environment (jukebox, radio, personal choice, etc.)

**Modern Integration:**
- Include 2-3 contemporary songs that genuinely capture the vintage aesthetic (not just retro-styled music)
- These should sound like they could time-travel into the original era

Please create a 15-20 song playlist that captures this exact aesthetic and mood. Each song choice must be defensible based on the specific cultural/aesthetic context described.

**Format Requirements:**
1. Full playlist with detailed explanations (why each song fits the SPECIFIC aesthetic, not just the general theme)
2. Simple list format for easy copying
3. Organize by energy/flow for optimal listening experience
4. Each explanation should reference specific details from the aesthetic description

**Quality Check:** Before finalizing, ask yourself:
- Would this playlist actually work in the described environment?
- Does each song contribute something unique to the aesthetic?
- Have I avoided lazy, obvious choices?
- Does the playlist tell a story that matches the concept?`;

    return prompt;
}

    showPromptModal(title, prompt) {
        const modal = document.createElement('div');
        modal.className = 'prompt-modal';
        modal.innerHTML = `
            <div class="prompt-modal-content">
                <div class="prompt-header">
                    <h2>AI Prompt for "${title}"</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="prompt-text">
                    <textarea readonly>${prompt}</textarea>
                </div>
                <div class="prompt-actions">
                    <button class="copy-prompt">Copy to Clipboard</button>
                    <button class="close-modal">Close</button>
                </div>
            </div>
        `;
        
        const textarea = modal.querySelector('textarea');
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(400, textarea.scrollHeight + 20) + 'px';
        
        modal.querySelector('.copy-prompt').addEventListener('click', () => {
            textarea.select();
            document.execCommand('copy');
            
            const button = modal.querySelector('.copy-prompt');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => button.textContent = originalText, 1000);
        });
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
    }

    goBack() {
        if (this.currentPath.length === 0) return;
        
        if (this.currentPath.length === 1) {
            this.showMenus();
        } else if (this.currentPath.length === 2) {
            this.showCategories(this.currentPath[0]);
        }
    }
}
