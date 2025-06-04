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
            'gordons_steakhouse.json'
        ];
    }

    async init() {
        await this.loadMenus();
        this.setupHomeClick(); // Add this
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
        
        document.getElementById('backButton').classList.remove('hidden');
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
        
        document.getElementById('backButton').classList.remove('hidden');
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
            breadcrumb.innerHTML = 'SELECT <span>MENU</span>';
        } else if (this.currentPath.length === 1) {
            const menuTitle = this.menus[this.currentPath[0]].title;
            breadcrumb.innerHTML = `<span>${menuTitle}</span> // SELECT <span>CATEGORY</span>`;
        } else if (this.currentPath.length === 2) {
            const menuTitle = this.menus[this.currentPath[0]].title;
            const categoryTitle = this.menus[this.currentPath[0]].categories[this.currentPath[1]].title;
            breadcrumb.innerHTML = `<span>${menuTitle}</span> // <span>${categoryTitle}</span> // SELECT <span>ITEM</span>`;
        }
    }

    updateNavigation() {
        // Clear all navigation levels
        document.getElementById('menuNav').innerHTML = '';
        document.getElementById('categoryNav').innerHTML = '';
        document.getElementById('itemNav').innerHTML = '';

        // Only show menu navigation - always visible
        Object.values(this.menus).forEach(menu => {
            const navItem = this.createNavItem(menu.title, this.currentPath[0] === menu.id, () => this.showCategories(menu.id));
            document.getElementById('menuNav').appendChild(navItem);
        });

        // Hide the other navigation levels when not needed
        const categoryNav = document.getElementById('categoryNav').parentElement;
        const itemNav = document.getElementById('itemNav').parentElement;
        
        if (this.currentPath.length === 0) {
            categoryNav.style.display = 'none';
            itemNav.style.display = 'none';
        } else {
            categoryNav.style.display = 'block';
            itemNav.style.display = 'none';
        }
    }

    createNavItem(title, isActive, onClick) {
        const item = document.createElement('div');
        item.className = `nav-item ${isActive ? 'active' : ''}`;
        item.textContent = title;
        item.onclick = onClick;
        return item;
    }

    generatePlaylist(menuId, categoryId, itemId) {
        const item = this.menus[menuId].categories[categoryId].items[itemId];
        alert(`Generating playlist for: ${item.title}\n\nThis would connect to your playlist generation system!`);
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