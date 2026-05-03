# Patient Profile & Family

**URL**: `/cloudcare/patient/profile`

## Page Overview
This page allows the user to manage their personal profile information and family/emergency contacts.

## UI Elements (data-vanthai-id)

### Profile Section
- `cloudcare-patient-profile-root`: Root container for the profile page.
- `cloudcare-profile-card`: The card containing personal information.
- `cloudcare-profile-edit-btn`: Button to start editing the profile.
- `cloudcare-profile-save-btn`: Button to save profile changes.
- `cloudcare-profile-field-name`: Full Name input field (name="name").
- `cloudcare-profile-field-age`: Age input field (name="age").
- `cloudcare-profile-field-gender`: Gender input field (name="gender").
- `cloudcare-profile-field-contact`: Contact Number input field (name="contact").
- `cloudcare-profile-field-address`: Address textarea field (name="address").

### Family Contacts Section
- `cloudcare-family-contacts-card`: Card containing family and emergency contacts.
- `cloudcare-family-add-btn`: Button to open the "Add Contact" dialog.
- `cloudcare-family-item-{id}`: Individual family contact list item.
- `cloudcare-family-delete-{id}`: Button to delete a family contact.

### Add Contact Dialog
- `cloudcare-family-dialog`: The dialog for adding a new contact.
- `cloudcare-family-field-name`: Name field in dialog (name="family-name").
- `cloudcare-family-field-relationship`: Relationship field in dialog (name="family-relationship").
- `cloudcare-family-field-contact`: Contact field in dialog (name="family-contact").
- `cloudcare-family-field-emergency`: Emergency checkbox in dialog (name="family-is-emergency").
- `cloudcare-family-save-btn`: Button to save the new contact.

## Available Actions
1. **View Profile**: Users can view their basic details and emergency status.
2. **Edit Profile**: Users can update their name, age, gender, contact, and address.
3. **Manage Family**: Users can add or delete family/emergency contacts.
