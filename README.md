# 🌟 BUP Alumni System
![Homepage](resources/UI_for_Home_page/homepage.png)

## Team Name: BUP Alumni Devs  
<br>

The BUP Alumni Management System is a web platform designed to strengthen communication and networking between BUP students and alumni. It provides separate authentication for students and alumni, an alumni profile and details section, mentorship offering and application features, event creation and management, a blood bank support option, and a contact page for easy communication. The system enables students to connect with alumni for guidance and opportunities, while alumni can manage mentorship sessions and community activities. The main objective is to create a collaborative environment that supports career growth, knowledge sharing, and social contribution within the BUP community.
<br>
<br>

## Team Members:
- Hasibul Islam Mitul – 2254901031
- Samia Maliha – 2254901043  
- Ishrat Jahan – 2254901071  
- Anika Tasnim Mrittika – 2254901115 


<br>

## Prerequisites Installation:
1. VS Code
2. MySQL
3. Node.js
4. Git

<br>

## How to Use

### 1. Clone the Project
* Install Git Bash if not already installed.  

* Open Git Bash in your local project directory and configure Git:

```bash
git config --global user.name <github_username>
git config --global user.email <github_email>
```

* Clone the repository:
```bash
git clone https://github.com/lamin43-BUP/BUP_Alumni.git
```


### 2. Navigate to the Project Directory
```bash
cd bup-alumni-system
```
Open the project in VS Code:
    ```bash
    code .
    ```

Open the terminal in VS Code: **Ctrl + J**


### 3. Install Dependencies
* Initialize npm project:
```bash
npm init -y
```

* Install production dependencies:
```bash
npm install express mysql2 bcryptjs cors dotenv nodemailer
```

### 4. Database Setup
Create the database and required tables step-by-step according to the structure provided in the database PDF.

### 5. Create .env file


### 6. Run the Project on VS code
```bash
node server.js
```


<br>
<br>


## 🛠️ How to Develop 

### 1\. Create a New Branch
 * Use a new branch before working on updates or features:
   ```bash
      git checkout -b <new-branch-name>
    ```

### 2\. Make Changes
   * Add new features or improvements.
   * Update the database tables or backend logic as needed.

### 3\. Commit and Push Changes

After making your changes, commit them to your current branch and push them to the remote repository:

  * Stage all modified files:
    ```bash
    git add .
    ```
  * Commit the changes with a descriptive message:
    ```bash
    git commit -m "Description of changes made"
    ```
  * Push your changes to the remote repository:
    ```bash
    git push origin <your_current_branch_name>
    ```

### 4\. Open a Pull Request

  * Create a Pull Request from your branch to the main branch.
  * Team members will review and provide feedback.

### 5\. Merge and Sync

  * Switch to the main branch:
    ```bash
    git checkout main
    ```
  * Update the main branch with the latest remote changes:
    ```bash
    git pull origin main
    ```
  * Delete the local branch:
    ```bash
    git branch -d <branch-name>
    ```
  * Delete the remote branch:
    ```bash
    git push origin --delete <branch-name>
    ```


