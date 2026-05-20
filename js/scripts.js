// Initialize localStorage data
function initializeData() {
    if (!localStorage.getItem('books')) {
        const defaultBooks = [
            { isbn: '9780747532743', title: 'Harry Potter', author: 'J.K. Rowling', publisher: 'Bloomsbury', year: 1997, category: 'Fiction', quantity: 5, available: 5, location: 'A-01' },
            { isbn: '9780141439518', title: 'Pride and Prejudice', author: 'Jane Austen', publisher: 'Penguin', year: 1813, category: 'Fiction', quantity: 3, available: 2, location: 'A-02' }
        ];
        localStorage.setItem('books', JSON.stringify(defaultBooks));
    }
    
    if (!localStorage.getItem('members')) {
        const defaultMembers = [
            { id: 'M1001', name: 'John Doe', email: 'john@example.com', phone: '1234567890', address: '123 Main St', membershipType: 'Standard', active: true, joinDate: new Date().toISOString() },
            { id: 'M1002', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', address: '456 Oak Ave', membershipType: 'Premium', active: true, joinDate: new Date().toISOString() }
        ];
        localStorage.setItem('members', JSON.stringify(defaultMembers));
    }
    
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('reservations')) {
        localStorage.setItem('reservations', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('nextMemberId')) {
        localStorage.setItem('nextMemberId', '1003');
    }
}

// Helper functions
function generateMemberId() {
    let nextId = parseInt(localStorage.getItem('nextMemberId'));
    const newId = `M${nextId}`;
    localStorage.setItem('nextMemberId', nextId + 1);
    return newId;
}

function showMessage(elementId, message, type) {
    const msgDiv = document.getElementById(elementId);
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.className = type;
        setTimeout(() => {
            msgDiv.textContent = '';
            msgDiv.className = '';
        }, 3000);
    }
}

function updateDashboardStats() {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    const totalBooks = books.reduce((sum, b) => sum + b.quantity, 0);
    const activeMembers = members.filter(m => m.active).length;
    const booksBorrowed = transactions.filter(t => !t.returnDate).length;
    const overdueCount = transactions.filter(t => !t.returnDate && new Date(t.dueDate) < new Date()).length;
    
    const totalBooksEl = document.getElementById('totalBooks');
    const totalMembersEl = document.getElementById('totalMembers');
    const booksBorrowedEl = document.getElementById('booksBorrowed');
    const overdueEl = document.getElementById('overdueBooks');
    
    if (totalBooksEl) totalBooksEl.textContent = totalBooks;
    if (totalMembersEl) totalMembersEl.textContent = activeMembers;
    if (booksBorrowedEl) booksBorrowedEl.textContent = booksBorrowed;
    if (overdueEl) overdueEl.textContent = overdueCount;
    
    const recentList = document.getElementById('recentBooksList');
    if (recentList) {
        recentList.innerHTML = books.slice(-5).reverse().map(b => `<li>${b.title} by ${b.author} (${b.quantity} copies)</li>`).join('');
    }
}

// Register Member
if (document.getElementById('registerForm')) {
    document.getElementById('memberId').value = generateMemberId();
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const members = JSON.parse(localStorage.getItem('members')) || [];
        const newMember = {
            id: document.getElementById('memberId').value,
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            membershipType: document.getElementById('membershipType').value,
            active: true,
            joinDate: new Date().toISOString()
        };
        
        members.push(newMember);
        localStorage.setItem('members', JSON.stringify(members));
        showMessage('message', 'Member registered successfully!', 'success');
        this.reset();
        document.getElementById('memberId').value = generateMemberId();
        updateDashboardStats();
    });
}

// Add Book
if (document.getElementById('addBookForm')) {
    document.getElementById('addBookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const isbn = document.getElementById('isbn').value;
        
        if (books.find(b => b.isbn === isbn)) {
            showMessage('message', 'Book with this ISBN already exists!', 'error');
            return;
        }
        
        const newBook = {
            isbn: isbn,
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            publisher: document.getElementById('publisher').value,
            year: document.getElementById('year').value,
            category: document.getElementById('category').value,
            quantity: parseInt(document.getElementById('quantity').value),
            available: parseInt(document.getElementById('quantity').value),
            location: document.getElementById('location').value
        };
        
        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        showMessage('message', 'Book added successfully!', 'success');
        this.reset();
        updateDashboardStats();
    });
}

// Remove Book
if (document.getElementById('searchBookBtn')) {
    document.getElementById('searchBookBtn').addEventListener('click', function() {
        const query = document.getElementById('searchBookInput').value.toLowerCase();
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const book = books.find(b => b.isbn === query || b.title.toLowerCase() === query);
        
        const resultDiv = document.getElementById('bookResult');
        if (book) {
            resultDiv.innerHTML = `<h3>Book Found:</h3>
                <p><strong>Title:</strong> ${book.title}</p>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Available:</strong> ${book.available}/${book.quantity}</p>`;
            document.getElementById('removeBookForm').style.display = 'block';
            document.getElementById('removeDetails').innerHTML = `Are you sure you want to remove "${book.title}"?`;
            
            document.getElementById('removeBookForm').onsubmit = function(e) {
                e.preventDefault();
                if (book.available < book.quantity) {
                    showMessage('message', 'Cannot remove: Book has copies currently borrowed!', 'error');
                    return;
                }
                const updatedBooks = books.filter(b => b.isbn !== book.isbn);
                localStorage.setItem('books', JSON.stringify(updatedBooks));
                showMessage('message', 'Book removed successfully!', 'success');
                setTimeout(() => location.reload(), 1500);
                updateDashboardStats();
            };
        } else {
            resultDiv.innerHTML = '<p class="error">Book not found!</p>';
            document.getElementById('removeBookForm').style.display = 'none';
        }
    });
}

// Borrow Book
if (document.getElementById('borrowForm')) {
    document.getElementById('borrowForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const memberId = document.getElementById('borrowMemberId').value;
        const isbn = document.getElementById('borrowBookIsbn').value;
        let dueDate = document.getElementById('dueDate').value;
        
        const members = JSON.parse(localStorage.getItem('members')) || [];
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        
        const member = members.find(m => m.id === memberId && m.active);
        if (!member) {
            showMessage('message', 'Invalid or inactive member ID!', 'error');
            return;
        }
        
        const book = books.find(b => b.isbn === isbn);
        if (!book) {
            showMessage('message', 'Book not found!', 'error');
            return;
        }
        
        if (book.available <= 0) {
            showMessage('message', 'No copies available!', 'error');
            return;
        }
        
        if (!dueDate) {
            const date = new Date();
            date.setDate(date.getDate() + 14);
            dueDate = date.toISOString().split('T')[0];
        }
        
        book.available--;
        const transaction = {
            id: `T${Date.now()}`,
            memberId: memberId,
            bookIsbn: isbn,
            bookTitle: book.title,
            borrowDate: new Date().toISOString(),
            dueDate: dueDate,
            returnDate: null
        };
        
        transactions.push(transaction);
        localStorage.setItem('books', JSON.stringify(books));
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        showMessage('message', `Book borrowed! Due date: ${dueDate}`, 'success');
        this.reset();
        updateDashboardStats();
    });
}

// Return Book
if (document.getElementById('loadUserBorrows')) {
    document.getElementById('loadUserBorrows').addEventListener('click', function() {
        const memberId = document.getElementById('returnMemberId').value;
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const activeBorrows = transactions.filter(t => t.memberId === memberId && !t.returnDate);
        
        const listDiv = document.getElementById('borrowedList');
        if (activeBorrows.length === 0) {
            listDiv.innerHTML = '<p>No active borrows for this member.</p>';
            return;
        }
        
        listDiv.innerHTML = '<h3>Borrowed Books:</h3>';
        activeBorrows.forEach(borrow => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.innerHTML = `<strong>${borrow.bookTitle}</strong> (ISBN: ${borrow.bookIsbn})<br>Due: ${borrow.dueDate}<br>
                <button onclick="selectReturn('${borrow.bookIsbn}')">Return This Book</button>`;
            listDiv.appendChild(div);
        });
    });
}

window.selectReturn = function(isbn) {
    document.getElementById('returnForm').style.display = 'block';
    document.getElementById('returnIsbn').value = isbn;
    
    document.getElementById('returnForm').onsubmit = function(e) {
        e.preventDefault();
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const memberId = document.getElementById('returnMemberId').value;
        
        const transaction = transactions.find(t => t.memberId === memberId && t.bookIsbn === isbn && !t.returnDate);
        const book = books.find(b => b.isbn === isbn);
        
        if (transaction && book) {
            transaction.returnDate = new Date().toISOString();
            book.available++;
            localStorage.setItem('books', JSON.stringify(books));
            localStorage.setItem('transactions', JSON.stringify(transactions));
            showMessage('message', 'Book returned successfully!', 'success');
            setTimeout(() => location.reload(), 1500);
            updateDashboardStats();
        }
    };
};

// Search
if (document.getElementById('searchBtn')) {
    function performSearch() {
        const query = document.getElementById('searchQuery').value.toLowerCase();
        const searchType = document.querySelector('input[name="searchType"]:checked').value;
        const books = JSON.parse(localStorage.getItem('books')) || [];
        
        let results = books;
        if (query) {
            results = books.filter(book => {
                if (searchType === 'all') {
                    return book.title.toLowerCase().includes(query) ||
                           book.author.toLowerCase().includes(query) ||
                           book.isbn.includes(query) ||
                           book.category.toLowerCase().includes(query);
                } else if (searchType === 'title') return book.title.toLowerCase().includes(query);
                else if (searchType === 'author') return book.author.toLowerCase().includes(query);
                else if (searchType === 'isbn') return book.isbn.includes(query);
                else if (searchType === 'category') return book.category.toLowerCase().includes(query);
                return false;
            });
        }
        
        const resultsDiv = document.getElementById('searchResults');
        if (results.length === 0) {
            resultsDiv.innerHTML = '<p>No books found.</p>';
        } else {
            resultsDiv.innerHTML = `<h3>Found ${results.length} book(s):</h3>` + 
                results.map(book => `<div class="book-item">
                    <strong>${book.title}</strong> by ${book.author}<br>
                    ISBN: ${book.isbn} | Category: ${book.category}<br>
                    Available: ${book.available}/${book.quantity}
                </div>`).join('');
        }
    }
    
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchQuery').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
}

// Reserve Book
if (document.getElementById('reserveForm')) {
    document.getElementById('reserveForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const memberId = document.getElementById('reserveMemberId').value;
        const isbn = document.getElementById('reserveBookIsbn').value;
        const reserveDate = document.getElementById('reserveDate').value || new Date().toISOString().split('T')[0];
        
        const members = JSON.parse(localStorage.getItem('members')) || [];
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        
        if (!members.find(m => m.id === memberId && m.active)) {
            showMessage('message', 'Invalid member!', 'error');
            return;
        }
        
        if (!books.find(b => b.isbn === isbn)) {
            showMessage('message', 'Book not found!', 'error');
            return;
        }
        
        const newReservation = {
            id: `R${Date.now()}`,
            memberId: memberId,
            bookIsbn: isbn,
            reserveDate: reserveDate,
            status: 'active'
        };
        
        reservations.push(newReservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        showMessage('message', 'Book reserved successfully!', 'success');
        this.reset();
    });
}

// Update Book
if (document.getElementById('loadBookBtn')) {
    document.getElementById('loadBookBtn').addEventListener('click', function() {
        const isbn = document.getElementById('updateSearchIsbn').value;
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const book = books.find(b => b.isbn === isbn);
        
        if (book) {
            document.getElementById('bookData').style.display = 'block';
            document.getElementById('updateTitle').value = book.title;
            document.getElementById('updateAuthor').value = book.author;
            document.getElementById('updatePublisher').value = book.publisher || '';
            document.getElementById('updateYear').value = book.year || '';
            
            const catSelect = document.getElementById('updateCategory');
            catSelect.innerHTML = '<option>Fiction</option><option>Non-Fiction</option><option>Science</option><option>History</option><option>Technology</option><option>Children</option>';
            catSelect.value = book.category;
            
            document.getElementById('updateQuantity').value = book.quantity;
            document.getElementById('updateLocation').value = book.location || '';
            
            document.getElementById('updateBookForm').onsubmit = function(e) {
                e.preventDefault();
                const diff = parseInt(document.getElementById('updateQuantity').value) - book.quantity;
                book.title = document.getElementById('updateTitle').value;
                book.author = document.getElementById('updateAuthor').value;
                book.publisher = document.getElementById('updatePublisher').value;
                book.year = document.getElementById('updateYear').value;
                book.category = document.getElementById('updateCategory').value;
                book.quantity = parseInt(document.getElementById('updateQuantity').value);
                book.available += diff;
                book.location = document.getElementById('updateLocation').value;
                
                localStorage.setItem('books', JSON.stringify(books));
                showMessage('message', 'Book updated successfully!', 'success');
                setTimeout(() => location.reload(), 1500);
                updateDashboardStats();
            };
        } else {
            showMessage('message', 'Book not found!', 'error');
        }
    });
}

// View Reports
if (document.querySelector('.report-tabs')) {
    function loadReport(tab) {
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const members = JSON.parse(localStorage.getItem('members')) || [];
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const content = document.getElementById('reportContent');
        
        if (tab === 'popular') {
            const borrowCount = {};
            transactions.forEach(t => { borrowCount[t.bookIsbn] = (borrowCount[t.bookIsbn] || 0) + 1; });
            const sorted = Object.entries(borrowCount).sort((a,b) => b[1] - a[1]).slice(0,10);
            content.innerHTML = '<h3>Most Popular Books</h3>' + sorted.map(([isbn, count]) => {
                const book = books.find(b => b.isbn === isbn);
                return `<div class="book-item"><strong>${book?.title || isbn}</strong> - Borrowed ${count} times</div>`;
            }).join('') || '<p>No borrow data yet.</p>';
        } else if (tab === 'active') {
            const activeMembers = members.filter(m => m.active);
            content.innerHTML = '<h3>Active Members</h3>' + activeMembers.map(m => 
                `<div class="member-item"><strong>${m.name}</strong> (${m.id}) - ${m.membershipType}</div>`
            ).join('');
        } else if (tab === 'overdue') {
            const overdue = transactions.filter(t => !t.returnDate && new Date(t.dueDate) < new Date());
            content.innerHTML = '<h3>Overdue Items</h3>' + overdue.map(t => 
                `<div class="book-item"><strong>${t.bookTitle}</strong> borrowed by ${t.memberId} - Due: ${t.dueDate}</div>`
            ).join('') || '<p>No overdue items.</p>';
        } else if (tab === 'inventory') {
            const lowStock = books.filter(b => b.available < 3);
            content.innerHTML = '<h3>Low Stock Alert (<3 copies)</h3>' + lowStock.map(b =>
                `<div class="book-item"><strong>${b.title}</strong> - Only ${b.available}/${b.quantity} available</div>`
            ).join('') || '<p>All books have sufficient stock.</p>';
        }
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadReport(this.dataset.tab);
        });
    });
    loadReport('popular');
}

// Manage Users
if (document.getElementById('memberSearch')) {
    function displayMembers(members) {
        const container = document.getElementById('membersList');
        container.innerHTML = members.map(m => `<div class="member-item">
            <strong>${m.name}</strong> (${m.id}) - ${m.email}<br>
            <button onclick="editMember('${m.id}')">Edit</button>
        </div>`).join('');
    }
    
    window.editMember = function(id) {
        const members = JSON.parse(localStorage.getItem('members')) || [];
        const member = members.find(m => m.id === id);
        if (member) {
            document.getElementById('editMemberArea').style.display = 'block';
            document.getElementById('editMemberId').value = member.id;
            document.getElementById('editName').value = member.name;
            document.getElementById('editEmail').value = member.email;
            document.getElementById('editPhone').value = member.phone || '';
            
            const typeSelect = document.getElementById('editMembershipType');
            typeSelect.innerHTML = '<option>Standard</option><option>Premium</option><option>Student</option>';
            typeSelect.value = member.membershipType;
        }
    };
    
    document.getElementById('editMemberForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const members = JSON.parse(localStorage.getItem('members')) || [];
        const id = document.getElementById('editMemberId').value;
        const member = members.find(m => m.id === id);
        
        if (member) {
            member.name = document.getElementById('editName').value;
            member.email = document.getElementById('editEmail').value;
            member.phone = document.getElementById('editPhone').value;
            member.membershipType = document.getElementById('editMembershipType').value;
            localStorage.setItem('members', JSON.stringify(members));
            showMessage('message', 'Member updated!', 'success');
            setTimeout(() => location.reload(), 1500);
            updateDashboardStats();
        }
    });
    
    document.getElementById('deleteMemberBtn')?.addEventListener('click', function() {
        if (confirm('Delete this member? This action cannot be undone.')) {
            const members = JSON.parse(localStorage.getItem('members')) || [];
            const id = document.getElementById('editMemberId').value;
            const filtered = members.filter(m => m.id !== id);
            localStorage.setItem('members', JSON.stringify(filtered));
            showMessage('message', 'Member deleted!', 'success');
            setTimeout(() => location.reload(), 1500);
            updateDashboardStats();
        }
    });
    
    document.getElementById('searchMemberBtn')?.addEventListener('click', function() {
        const query = document.getElementById('memberSearch').value.toLowerCase();
        const members = JSON.parse(localStorage.getItem('members')) || [];
        const filtered = members.filter(m => m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query));
        displayMembers(filtered);
    });
    
    const allMembers = JSON.parse(localStorage.getItem('members')) || [];
    if (document.getElementById('membersList')) displayMembers(allMembers);
}

// Initialize on page load
initializeData();
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    updateDashboardStats();
}