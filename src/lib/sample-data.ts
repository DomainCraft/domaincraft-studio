export const sampleYaml = `project:
  name: EcommercePlatform
  description: Sample e-commerce API
database: postgresql
auth:
  type: jwt
  entity: User
  roles: [Admin, Editor, Customer]
  endpoints:
    login: true
    register: true
    me: true

enums:
  UserRole:
    - Admin
    - Editor
    - Customer
    - Guest
  OrderStatus:
    - Pending
    - Paid
    - Shipped
    - Delivered
    - Cancelled

entities:
  User:
    fields:
      id: uuid [primary]
      email: string [required, unique, email]
      password: string [required, hidden]
      firstName: string [required, min:2, max:50]
      lastName: string [required, min:2, max:50]
      role: enum(UserRole) [default:Customer]
      phoneNumbers: array(string)
      isActive: boolean [default:true]
    features:
      - audit
      - soft_delete
    permissions:
      read: ["*"]
      create: ["*"]
      update: ["@Owner", Admin]
      delete: [Admin]

  Product:
    fields:
      id: uuid [primary]
      title: string [required, min:3, max:200]
      description: text
      price: decimal [required, gte:0]
      sku: string [unique]
      tags: array(string)
      supplierId: relation(User)
    features:
      - audit
      - soft_delete
    permissions:
      read: ["*"]
      create: [Admin]
      update: [Admin]
      delete: [Admin]
    seed:
      - id: "550e8400-e29b-41d4-a716-446655440001"
        title: "Widget"
        price: "9.99"
        sku: "WIDGET-001"

  Order:
    fields:
      id: uuid [primary]
      userId: relation(User) [required]
      status: enum(OrderStatus) [default:Pending]
      total: decimal [required, gte:0]
    features:
      - audit
      - optimistic_lock
    permissions:
      read: [Admin, "@Owner"]
      create: [User]
      update: ["@Owner"]
      delete: [Admin]
`;
