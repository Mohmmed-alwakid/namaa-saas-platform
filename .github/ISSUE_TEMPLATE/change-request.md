---
name: 🔄 Change Request
about: Submit a change to existing requirements or features
title: '[CHANGE] Brief description of change'
labels: ['change-request', 'needs-review']
assignees: []
---

## 📋 Change Request Information

**Change Request ID**: CR-{{ date | date: "%Y-%m-%d" }}-XXX  
**Priority**: [ ] Critical [ ] High [ ] Medium [ ] Low  
**Requestor**: @{{ author }}  
**Date**: {{ date | date: "%Y-%m-%d" }}

---

## 🎯 Change Details

### Current Behavior
[Describe how the feature/system currently works]

### Desired Behavior  
[Describe how it should work after the change]

### Business Justification
[Why is this change needed? What value does it provide?]

---

## 📊 Impact Assessment

### Users Affected
- [ ] All users
- [ ] Subset of users (specify): ________________
- [ ] Admin users only
- [ ] Internal team only

### Systems Affected
- [ ] Frontend UI
- [ ] Backend API
- [ ] Database schema
- [ ] External integrations
- [ ] Mobile app

### Effort Estimate
- [ ] < 1 day
- [ ] 1-3 days  
- [ ] 1 week
- [ ] 2+ weeks
- [ ] Needs technical assessment

---

## ✅ Requirements Checklist

### Before Development
- [ ] **Product Manager Review**: Change request reviewed and approved
- [ ] **Technical Assessment**: Technical feasibility confirmed
- [ ] **Impact Analysis**: Full impact assessment completed
- [ ] **Resource Allocation**: Development resources assigned
- [ ] **Timeline**: Implementation timeline agreed upon

### Documentation Required
- [ ] **Updated PRD**: Product requirements document updated
- [ ] **User Story**: New/updated user stories created
- [ ] **Test Plan**: QA testing plan updated
- [ ] **API Docs**: API documentation updated (if applicable)

---

## 🔄 Approval Workflow

### Product Manager Approval
- [ ] **Business Impact**: ✅ Approved ❌ Rejected ⏳ Needs Discussion
- [ ] **Priority**: Confirmed priority level
- [ ] **Timeline**: Agreed implementation timeline
- **Comments**: _______________

### Technical Lead Approval  
- [ ] **Technical Feasibility**: ✅ Approved ❌ Rejected ⏳ Needs Discussion
- [ ] **Architecture Impact**: Assessed and documented
- [ ] **Effort Estimate**: Confirmed development effort
- **Comments**: _______________

### Stakeholder Sign-off
- [ ] **Final Approval**: ✅ Approved for implementation
- **Approved By**: _______________
- **Date**: _______________

---

## 📝 Implementation Notes

### Development Checklist
- [ ] Code implementation completed
- [ ] Unit tests written and passing
- [ ] Integration tests updated
- [ ] Code review completed
- [ ] Documentation updated

### QA Checklist  
- [ ] Functional testing completed
- [ ] Regression testing passed
- [ ] Performance testing (if applicable)
- [ ] User acceptance testing completed

---

**⚠️ This change request must be approved before any development begins**

**Process Questions?** See [Product Management Process](../product-management/README.md)
