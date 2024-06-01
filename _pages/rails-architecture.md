---
layout: post
title: "ASDF Architecture for Ruby Development"
---

## ASDF Architecture for Ruby Development

**ASDF Overview**  
ASDF offers robust version management, allowing developers to install and switch between multiple Ruby versions seamlessly. This is particularly advantageous for those working on multiple projects with different Ruby version requirements. By using ASDF, developers can maintain consistency across development, testing, and production environments, minimizing version-related deployment issues.

**Key Advantages of ASDF:**
1. **Consistent Environments:** Ensures the same Ruby version is used across all stages of development, preventing discrepancies.
2. **Project-Specific Versions:** Allows specification of Ruby versions per project, ensuring compatibility and ease of setup for new developers.
3. **CI/CD Integration:** Integrates well with CI/CD pipelines, enabling consistent builds and automated version installations for reliable deployments.
4. **Conflict Reduction:** Isolates Ruby environments to prevent conflicts between global and project-specific versions.
5. **User-Friendly:** Offers simple commands and an extensive plugin ecosystem for managing various programming languages and tools.
6. **Cross-Platform Support:** Provides flexibility and a consistent experience across different operating systems.

## Frontend Architecture

**Stimulus:**  
A minimal JavaScript framework that enhances HTML without complexity.

**iOS and Android Stimulus Apps:**  
Utilizes Stimulus for building responsive and lightweight applications for mobile platforms.

**Frontend Gems:**  
These gems enhance the frontend experience, including internationalization, geolocation, and displaying local times.
- **Mobility:** Offers flexible translations for ActiveRecord models.
- **Rails-i18n:** Adds localization support to Rails applications.
- **Geokit:** Adds geolocation functionality, including distance calculations and location-based queries.
- **Local_time:** Displays times in the user's local time zone.

## Backend Architecture

**Ruby Backend Architecture:**  
Our team employs several robust architectures defined with various gems to ensure scalable and maintainable codebases. The primary goal of these architectures is to separate concerns, manage execution flow, and maintain data integrity and concurrency control within the application.

**Code Separation and Execution Gems:**
These gems focus on managing execution flow, background jobs, and ensuring data integrity and concurrency control within your application.
- **Aasm:** Manages state transitions within Ruby classes.
- **After_commit_everywhere:** Provides after_commit callbacks outside ActiveRecord.
- **Sidekiq:** Handles asynchronous background jobs using Redis.
- **With_advisory_lock:** Ensures code sections are executed by only one process at a time to prevent race conditions.
- **Sidekiq-scheduler:** Adds cron-like job scheduling capabilities to Sidekiq.

**User Management and Business Logic Gems:**  
These gems handle authentication, authorization, multi-tenancy, and business rules within your application.
- **Devise:** Provides flexible authentication solutions for Rails.
- **Omniauth:** Integrates multiple authentication providers.
- **Acts_as_tenant:** Adds multi-tenancy support.
- **Rolify:** Manages user roles.
- **Pundit:** Implements object-oriented authorization policies.

**Helper Gems:**  
These gems provide additional utilities and helper methods to simplify development and enhance application features.
- **Foreman:** Manages Procfile-based applications for running multiple processes.
- **Administrate:** Adds an admin dashboard to Rails applications.
- **Phonelib:** Validates and formats phone numbers.
- **Twilio-ruby:** Interacts with the Twilio API for SMS and call functionality.
- **Phony_rails:** Normalizes and validates phone numbers.
- **Pagy:** A fast and lightweight pagination library.
- **Nilify_blanks:** Automatically sets blank fields to nil before saving objects.
- **Paranoia:** Provides soft delete functionality for ActiveRecord.
- **Friendly_id:** Enables human-friendly URLs using string slugs for ActiveRecord models.

**Code Separation and Execution:**
In application development we enconuter various scenarios where we need to manage execution flow, background jobs, and ensure data integrity and concurrency control within the application.
Orders usually go through various states like pending, processing, shipped, and delivered. The `aasm` gem helps manage these state transitions within Ruby classes.
```ruby
class Order
  aasm column: :status do
  state :created, initial: true
  state :paid, :ready, :delivered
  
    event :pay, after_commit: :notify_about_paid_order do
      transitions from: :created, to: :paid
    end

    event :ready, after_commit: :notify_about_ready_order do
      transitions from: %i[paid], to: :ready
    end

    event :deliver, after_commit: :notify_about_order_delivered do
      transitions from: %i[ready], to: :delivered
    end

    def notify_about_paid_order
      # Send email notification
    end

    def notify_about_ready_order
      # Send email notification
    end

    def notify_about_order_delivered
      # Send email notification
    end
  end
end
```

In the code above we define an `Order` class with various states like `created`, `paid`, `ready`, and `delivered`. We use the `aasm` gem to manage state transitions and define events like `pay`, `ready`, and `deliver`. We also define callbacks to send email notifications after the order transitions to a specific state.
If we wish to execute a specific code block after an order is paid, we can use the `after_commit` callback to ensure the order is successfully saved to the database before executing the code.

**Background Jobs:**
In a web application, we often need to perform tasks asynchronously to improve performance and user experience. The `sidekiq` gem is a popular choice for handling background jobs in Rails applications. It uses Redis as a backend to store job information and provides a simple and efficient way to process jobs in the background.
Lets define a simple worker class that sends an email notification when an order is paid.
```ruby
class OrderPaidWorker
  include Sidekiq::Worker

  def perform(order_id)
    order = Order.find(order_id)
    OrderMailer.notify_paid_order(order).deliver_now
  end
end
```

OrderPaidWorker is a simple worker class that includes the Sidekiq::Worker module. It defines a perform method that takes an order_id as an argument, finds the corresponding order, and sends an email notification using the OrderMailer class.
We can enqueue this worker when an order is paid by calling the perform_async method in the Order class.

How about we send a push notification when the order is ready for delivery? We can define another worker class for this purpose.
```ruby
class OrderReadyWorker
  include Sidekiq::Worker

  def perform(order_id)
    order = Order.find(order_id)
    PushNotificationService.notify_order_ready(order)
  end
end
```

OrderReadyWorker is another worker class that includes the Sidekiq::Worker module. It defines a perform method that takes an order_id as an argument, finds the corresponding order, and sends a push notification using the PushNotificationService class.
We can enqueue this worker when an order is ready by calling the perform_async method in the Order class.

For the last part of the order lifecycle, we can define a method in the Order class to send an SMS notification when the order is delivered.

```ruby
class OrderDeliveredWorker
  include Sidekiq::Worker

  def perform(order_id)
    order = Order.find(order_id)
    SmsService.send_order_delivered_sms(order)
  end
end
```


```ruby
class Order
  aasm column: :status do
  state :created, initial: true
  state :paid, :ready, :delivered
  
    event :pay, after_commit: :notify_about_paid_order do
      transitions from: :created, to: :paid
    end

    event :ready, after_commit: :notify_about_ready_order do
      transitions from: %i[paid], to: :ready
    end

    event :deliver, after_commit: :notify_about_order_delivered do
      transitions from: %i[ready], to: :delivered
    end

    def notify_about_paid_order
      OrderPaidWorker.perform_async(id)
    end

    def notify_about_ready_order
      OrderReadyWorker.perform_async(id)
    end

    def notify_about_order_delivered
      OrderDeliveredWorker.perform_async(id)
    end
  end
end
```

In the code above, we define three worker classes, OrderPaidWorker, OrderReadyWorker, and OrderDeliveredWorker, to handle email notifications, push notifications, and SMS notifications, respectively. We enqueue these workers in the corresponding state transition methods of the Order class to execute the notifications asynchronously.
This approach ensures that the order processing logic is decoupled from the notification logic, allowing for better scalability and maintainability of the application.

What if now we have a race condition where two processes try to update the same order at the same time? We can use the `with_advisory_lock` gem to ensure that only one process can execute a specific code section at a time.
In this case we can use the `with_advisory_lock` method to update the order status in a synchronized manner.

```ruby
class Order < ApplicationRecord
  def update_status(new_status)
    with_advisory_lock("order_#{id}") do
      update(status: new_status)
    end
  end
end
```

Or we can use the `with_advisory_lock` method to ensure that only one process can execute a specific code section at a time wich in this case can be order creation for the restaurant.

```ruby
class Restaurant < ApplicationRecord
  def create_order(order_params)
    with_advisory_lock("restaurant_#{id}_order_creation") do
      orders.create(order_params)
    end
  end
end
```

In the code above, we define an update_status method in the Order class that uses the with_advisory_lock method to ensure that only one process can update the order status at a time. We pass a unique lock key based on the order id to prevent
This way if we have a limited ammount of products in stock we can use the `with_advisory_lock` method to ensure that only one process can update the stock at a time.

```ruby
class Product < ApplicationRecord
  def update_stock(quantity)
    with_advisory_lock("product_#{id}_stock_update") do
      update(stock: stock - quantity)
    end
  end
end
```

In the code above, we define an update_stock method in the Product class that uses the with_advisory_lock method to ensure that only one process can update the product stock at a time. We pass a unique lock key based on the product id to

What if we need to schedule a job to send a reminder email to customers who have abandoned their shopping carts? We can use the `sidekiq-scheduler` gem to add cron-like job scheduling capabilities to Sidekiq.

```ruby
class CartReminderWorker
  include Sidekiq::Worker

  def perform
    abandoned_carts = Cart.where('updated_at < ?', 1.day.ago)
    abandoned_carts.each do |cart|
      CartMailer.send_reminder_email(cart).deliver_now
    end
  end
end
```

To schedule it to run every day at midnight, we can add the following configuration to the sidekiq.yml file.

```yaml
:schedule:
  cart_reminder:
    cron: '0 0 * * *'
    class: 'CartReminderWorker'
```

In the code above, we define a CartReminderWorker class that includes the Sidekiq::Worker module. It defines a perform method that finds abandoned shopping carts older than one day and sends a reminder email to the customers. We use the sidekiq-scheduler gem to configure the job to run every day at midnight.

By using these gems and techniques, we can effectively manage execution flow, background jobs, data integrity, and concurrency control within our Ruby on Rails applications, ensuring robustness, scalability, and maintainability.

**User Management and Business Logic**

Gems above are working together to provide a robust user management and business logic layer for your application.

We will use the following gems to manage user authentication, authorization, multi-tenancy, and business rules within your application.

**Devise:**
Devise is a flexible authentication solution for Rails applications that provides a full set of authentication features, including user registration, login, password reset, and session management. It offers customizable views, controllers, and models to fit the specific requirements of your application.

**Omniauth:**
Omniauth is a popular authentication library that integrates multiple authentication providers, such as Google, Facebook, Twitter, and GitHub, into your Rails application. It simplifies the process of implementing OAuth-based authentication and allows users to sign in using their existing social media accounts.

When we create User objects in our application, we can use the `devise` gem to handle user authentication and authorization. Devise provides a set of modules that can be included in the User model to add authentication features such as registration, login, password reset, and session management.

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
end
```

Now we will create the Account model and use the `acts_as_tenant` gem to add multi-tenancy support to our application. This gem allows us to create separate data silos for different tenants, such as organizations or users, and ensures data isolation between tenants.

```ruby
class Account < ApplicationRecord
  acts_as_tenant :user
end
```

Accounts are a core piece of functionality for many applications these days and the name Account is a generic term but can be thought of as a vehicle for creating teams or organizations as well as personal accounts.

The Account model is the mechanism that allows resources to be scoped to an account of one user or a varying number of users based on the type of account. This way the resource(s) will be scoped to each customer of your SaaS/application.

By default when a new user signs up they will have an account created for them that does not allow them to invite anyone else to it. This is known as a personal (solo) account in Jumpstart Pro. After this initial account is created the user can create other accounts which will by default allow them to invite other users to the account. This is what many consider to be a team account. If you always want the accounts that are created when a new user signs up to be team accounts, then you can disable the personal account creation option via the configuration wizard.

Lets create a migration and modesl for user and account.

```ruby
class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
      t.timestamps
    end
  end
end
```

```ruby
class CreateAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :accounts do |t|
      t.string :name
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
  end
end
```

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :accounts
end
```

```ruby
class Account < ApplicationRecord
  acts_as_tenant :user
  belongs_to :user
end
```

GitHub is an example of a similar flow that has both personal (solo) and team accounts. Many users of GitHub start off with a personal (solo) account and then later add new team account (GitHub calls these organization accounts) so they can add users and collaborate within that team account.

Continuing with the GitHub example when you first create your personal account, all of your repositories are only available to you. If you create a team account, you can then invite others to the team and share access to repositories to all members of that team. This type of team account is the account type that will be created every time an existing user creates a new account after the initial personal account in your Jumpstart Pro application out-of-the-box.

If you decide to disable the creation of personal (solo) accounts, then the default behavior is to create a team account for users upon sign up for your Jumpstart Pro application. If the initial team account has only one user it is similar to a personal account, but they can invite users later if desired or necessary. If so, this should be conveyed to the end user in the UI.

Now lets enhance the user and account so that we have personal accounts and team accounts but all with same models and we change the migration

```ruby
class CreateAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :accounts do |t|
      t.string :name
      t.references :user, null: false, foreign_key: true
      t.boolean :personal, default: true
      t.timestamps
    end
  end
end
```

```ruby
class Account < ApplicationRecord
  acts_as_tenant :user
  belongs_to :user
end
```

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :accounts
end
```
Now lets add the logic to create a personal account for the user when they sign up and then they can create team accounts later.

```ruby
class Users::RegistrationsController < Devise::RegistrationsController
  def create
    super do |user|
      user.accounts.create(name: "Personal Account")
    end
  end
end
```

```ruby
class Account < ApplicationRecord
  acts_as_tenant :user
  belongs_to :user
  validates :name, presence: true
end
```

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :accounts
end
```

##### YEA

To implement the Rails models and migrations based on the diagrams provided, we will follow these steps:

1. **Create the User model**.
2. **Create the Account model**.
3. **Create the AccountUser join model**.
4. **Add the necessary associations and methods to support the flow as described**.

Here's how to create the models and migrations:

### Step 1: Create the User model

If you don't have the `User` model yet, generate it first.

```bash
rails generate model User name:string email:string
```

Then, run the migration:

```bash
rails db:migrate
```

### Step 2: Create the Account model

Generate the `Account` model with the necessary fields.

```bash
rails generate model Account name:string owner:references{polymorphic} type:string
```

Modify the generated migration to set up polymorphic association:

```ruby
class CreateAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :accounts do |t|
      t.string :name
      t.references :owner, polymorphic: true, null: false
      t.string :type

      t.timestamps
    end
  end
end
```

Run the migration:

```bash
rails db:migrate
```

### Step 3: Create the AccountUser join model

Generate the `AccountUser` model.

```bash
rails generate model AccountUser user:references account:references admin:boolean
```

Run the migration:

```bash
rails db:migrate
```

### Step 4: Define the necessary associations and methods in the models

#### `user.rb`

```ruby
class User < ApplicationRecord
  has_many :account_users
  has_many :accounts, through: :account_users
  has_one :personal_account, -> { where(type: 'PersonalAccount') }, class_name: 'Account', as: :owner

  after_create :create_personal_account

  private

  def create_personal_account
    personal_account = accounts.create(name: name, owner: self, type: 'PersonalAccount')
    AccountUser.create(user: self, account: personal_account, admin: true)
  end
end
```

#### `account.rb`

```ruby
class Account < ApplicationRecord
  belongs_to :owner, polymorphic: true
  has_many :account_users
  has_many :users, through: :account_users

  def personal?
    type == 'PersonalAccount'
  end

  def team?
    type == 'TeamAccount'
  end
end
```

#### `account_user.rb`

```ruby
class AccountUser < ApplicationRecord
  belongs_to :user
  belongs_to :account
end
```

### Step 5: Create Inheritance for Account Types

Generate a migration to add inheritance for account types.

```bash
rails generate model PersonalAccount --parent Account
rails generate model TeamAccount --parent Account
```

The migrations should automatically pick up the inheritance from the `Account` model.

### Step 6: Controllers and Views

You can now set up your controllers and views to use the `current_account` as mentioned in your provided documentation.

#### Example `posts_controller.rb`

```ruby
class PostsController < ApplicationController
  before_action :set_account

  def index
    @posts = @account.posts
  end

  private

  def set_account
    @account = current_user.accounts.find(params[:account_id])
  end
end
```

### Step 7: Configuration Options

You can set up configuration options to toggle between creating personal and team accounts upon signup. This can be done by adding a setting in your application configuration and checking it in the `create_personal_account` method in the `User` model.

### Configuration Example:

```ruby
# config/initializers/account_setup.rb
Rails.application.config.account_creation = :personal_and_team # or :team_only
```

Modify the `create_personal_account` method to check this setting.

```ruby
class User < ApplicationRecord
  # ... other code ...

  private

  def create_personal_account
    if Rails.application.config.account_creation == :personal_and_team
      personal_account = accounts.create(name: name, owner: self, type: 'PersonalAccount')
      AccountUser.create(user: self, account: personal_account, admin: true)
    else
      team_account = accounts.create(name: name, owner: self, type: 'TeamAccount')
      AccountUser.create(user: self, account: team_account, admin: true)
    end
  end
end
```

This setup ensures that the application's account creation logic aligns with the provided flow diagrams and can be toggled between personal and team accounts.

##### YEA

After creating the models and migrations, you can set up the necessary associations and methods to support the user account flow as described in the diagrams.
Now we will create the models and migrations based on the provided diagrams and set up the necessary associations and methods to support the user account flow.
And we also need to add rolify and pundit to manage user roles and authorization policies.

### Step 1: Modify existing User and Account Models

First, modify the existing `User` and `Account` models to include the necessary associations and methods.

#### `user.rb`

```ruby
class User < ApplicationRecord
  has_many :account_users
  has_many :accounts, through: :account_users
  has_many :roles, through: :account_users
end
```

#### `account.rb`

```ruby
class Account < ApplicationRecord
  has_many :account_users
  has_many :users, through: :account_users
end
```

### Step 2: Create Addmi, Super Admin and normal roles

```ruby
rails generate model Role name:string
```

```ruby
class Role < ApplicationRecord
  has_many :account_users
end
```
  




## Ruby Development Best Practices

**Ruby OOP:**  
Employ object-oriented programming principles for modular, reusable, and maintainable code.

**Ruby TDD:**  
Adopt test-driven development to ensure code reliability and quality.

**Refactoring Techniques:**  
Learn methods for improving code readability, reducing complexity, and enhancing performance.

**CI/CD Practices:**  
Automate testing and deployment to streamline workflows and ensure rapid, high-quality software delivery.

By leveraging these tools, best practices, and ASDF's capabilities, developers can effectively manage and enhance Ruby on Rails applications, ensuring robustness, scalability, and maintainability.
