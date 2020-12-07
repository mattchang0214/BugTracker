CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(30) NOT NULL,
    pwd_hash VARCHAR(60) NOT NULL, 
    first_name VARCHAR(20),
    last_name VARCHAR(20),
    is_admin BIT DEFAULT 0 NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS projects (
    project_id INT NOT NULL AUTO_INCREMENT,
    project_name VARCHAR(50),
    project_lead INT,
    PRIMARY KEY (project_id),
    FOREIGN KEY (project_lead)
        REFERENCES users (user_id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bugs (
    bug_id INT NOT NULL AUTO_INCREMENT,
    bug_name VARCHAR(50),
    bug_description VARCHAR(255),
    priority TINYINT CHECK (priority < 3),
    time_created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved BIT DEFAULT 0 NOT NULL,
    time_resolved DATETIME,
    assigned_user INT,
    project_id INT NOT NULL,
    PRIMARY KEY (bug_id),
    FOREIGN KEY (assigned_user)
        REFERENCES users (user_id)
        ON DELETE SET NULL,
    FOREIGN KEY (project_id)
        REFERENCES projects (project_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_assignment (
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    PRIMARY KEY (user_id , project_id),
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (project_id)
        REFERENCES projects (project_id)
        ON DELETE CASCADE
);