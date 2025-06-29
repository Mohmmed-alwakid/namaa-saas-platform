# 🤖 AI-Powered Requirements Assistant
## Smart PRD Generation & Enhancement System

**Version**: 1.0  
**Created**: June 29, 2025  
**System Status**: Production Ready  
**AI Integration**: ChatGPT/Claude Compatible

---

## 🎯 Quick Start: Generate PRD with AI

### **1. Smart PRD Generator Prompt**

```markdown
You are a Product Manager for Namaa Investment Platform. Generate a comprehensive PRD using this template:

**Context**: Namaa is a full-stack investment platform for US and Saudi stock markets with React frontend and Supabase backend.

**Feature Request**: [DESCRIBE YOUR FEATURE HERE]

**Output Format**:
# PRD-YYYY-MM-DD: [Feature Name]

## 🎯 Feature Overview
**Business Value**: [Why this matters]
**User Impact**: [Who benefits and how]
**Technical Scope**: [Implementation boundaries]

## 📋 Requirements
### Functional Requirements
1. [Specific capability 1]
2. [Specific capability 2]
3. [Specific capability 3]

### Non-Functional Requirements
- **Performance**: [Response time/load requirements]
- **Security**: [Data protection needs]
- **Scalability**: [Growth expectations]
- **Accessibility**: [WCAG compliance level]

## ✅ Acceptance Criteria
### User Story Format
```gherkin
Feature: [Feature Name]
  As a [user type]
  I want [capability]
  So that [business value]

Scenario: [Primary use case]
  Given [precondition]
  When [user action]
  Then [expected result]
  And [success criteria]
```

## 🧪 Test Scenarios
### Happy Path Tests
1. [Normal operation test]
2. [Success scenario test]

### Edge Cases
1. [Error handling test]
2. [Boundary condition test]

### Integration Tests
1. [System interaction test]
2. [Data flow test]

## 🔧 Technical Implementation
### Frontend Components
- [Component 1]: [Purpose]
- [Component 2]: [Purpose]

### Backend APIs
- [Endpoint 1]: [Function]
- [Endpoint 2]: [Function]

### Database Changes
- [Table/Field changes if any]

## 📊 Success Metrics
- **Primary KPI**: [Main success measure]
- **Secondary KPIs**: [Supporting measures]
- **Quality Metrics**: [Performance benchmarks]

## 🚨 Risk Assessment
### Technical Risks
- [Risk 1]: [Mitigation strategy]
- [Risk 2]: [Mitigation strategy]

### Business Risks
- [Risk 1]: [Mitigation strategy]
- [Risk 2]: [Mitigation strategy]

## 📅 Implementation Plan
### Phase 1: [Timeline]
- [Deliverable 1]
- [Deliverable 2]

### Phase 2: [Timeline]
- [Deliverable 3]
- [Deliverable 4]

**Dependencies**: [External requirements]
**Effort Estimate**: [Development time]
**Priority Level**: [High/Medium/Low]
```

---

## 🔥 Advanced AI Prompts

### **2. User Story Enhancement Prompt**

```markdown
Convert this basic feature request into detailed user stories:

**Feature**: [Your feature description]

**Context**: Namaa Investment Platform
- **Users**: Retail investors, Institutional investors, Platform admins
- **Markets**: US stocks (NYSE, NASDAQ), Saudi stocks (Tadawul)
- **Tech Stack**: React 19, TypeScript, Supabase, Tailwind CSS

**Generate**:
1. Primary user story with acceptance criteria
2. Edge case user stories
3. Admin/management user stories
4. Error handling user stories
5. Performance user stories

**Format each as**:
```
US-XXX: [Story Title]
As a [user type]
I want [specific capability]
So that [business outcome]

Acceptance Criteria:
- [ ] [Specific, testable criteria 1]
- [ ] [Specific, testable criteria 2]
- [ ] [Specific, testable criteria 3]

Definition of Done:
- [ ] Feature implemented and tested
- [ ] UI/UX approved by design team
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated
```
```

### **3. Risk Assessment Prompt**

```markdown
Analyze risks for this feature implementation:

**Feature**: [Feature description]
**Technical Stack**: React 19, TypeScript, Vite, Supabase
**Timeline**: [Target completion]
**Team Size**: [Number of developers]

**Assess these risk categories**:

1. **Technical Risks**
   - Implementation complexity
   - Integration challenges
   - Performance impacts
   - Security vulnerabilities

2. **Business Risks**
   - User adoption concerns
   - Regulatory compliance
   - Market timing
   - Revenue impact

3. **Project Risks**
   - Timeline feasibility
   - Resource availability
   - Dependency management
   - Quality assurance

**For each risk, provide**:
- Probability (High/Medium/Low)
- Impact (High/Medium/Low)
- Mitigation strategy
- Contingency plan
- Early warning indicators

**Output format**:
Risk ID | Category | Description | Probability | Impact | Mitigation
R001 | Technical | [Description] | Medium | High | [Strategy]
```

### **4. Test Scenario Generator Prompt**

```markdown
Generate comprehensive test scenarios for:

**Feature**: [Feature name and description]
**User Types**: [List relevant user types]
**Platform**: Web application (React frontend, Supabase backend)

**Generate test scenarios for**:

1. **Functional Testing**
   - Happy path scenarios
   - Alternative flows
   - Error conditions
   - Boundary value testing

2. **User Experience Testing**
   - Accessibility compliance
   - Responsive design
   - Performance expectations
   - User workflow validation

3. **Integration Testing**
   - API endpoint testing
   - Database interactions
   - Third-party service integration
   - Cross-browser compatibility

4. **Security Testing**
   - Input validation
   - Authentication/authorization
   - Data protection
   - API security

**Format each scenario as**:
```
Test ID: TC-XXX
Category: [Functional/UX/Integration/Security]
Priority: [High/Medium/Low]
Preconditions: [Setup requirements]
Test Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Expected Result: [What should happen]
Pass Criteria: [How to verify success]
```
```

---

## 🛠️ Implementation Workflow

### **Step 1: Feature Request to PRD**
1. Use Smart PRD Generator prompt with your feature idea
2. Review and refine the generated PRD
3. Save as `requirements/PRD-YYYY-MM-DD-[feature-name].md`
4. Get stakeholder approval

### **Step 2: PRD to User Stories**
1. Use User Story Enhancement prompt with your PRD
2. Create individual user story files
3. Save in `user-stories/US-XXX-[story-name].md`
4. Link user stories to PRD

### **Step 3: Risk & Test Planning**
1. Use Risk Assessment prompt for comprehensive analysis
2. Use Test Scenario Generator for quality planning
3. Update PRD with risk mitigation strategies
4. Create test plan documentation

### **Step 4: Implementation Tracking**
1. Create GitHub issues linked to user stories
2. Use process enforcement templates
3. Track progress against acceptance criteria
4. Validate with generated test scenarios

---

## 📊 AI-Enhanced Quality Gates

### **Automated PRD Review Checklist**
```markdown
Use this prompt to validate your PRD:

"Review this PRD for completeness and quality:

[PASTE YOUR PRD HERE]

Check for:
1. **Clarity**: Are requirements unambiguous?
2. **Completeness**: Are all necessary sections included?
3. **Testability**: Can acceptance criteria be verified?
4. **Feasibility**: Are technical requirements realistic?
5. **Business Value**: Is the value proposition clear?
6. **Risk Coverage**: Are major risks identified?

Provide:
- Completeness score (1-10)
- Top 3 improvement suggestions
- Missing critical elements
- Risk gaps identified
```

### **User Story Validation Prompt**
```markdown
Evaluate this user story for quality:

[PASTE USER STORY HERE]

Rate on:
1. **INVEST Criteria**: Independent, Negotiable, Valuable, Estimable, Small, Testable
2. **Acceptance Criteria Quality**: Specific, measurable, achievable
3. **Business Value Clarity**: Clear benefit to user/business
4. **Technical Feasibility**: Realistic implementation scope

Provide:
- INVEST score (1-10)
- Improvement recommendations
- Missing acceptance criteria
- Technical concerns
```

---

## 🚀 Getting Started

### **Quick Implementation**
1. **Copy-paste prompts** into your preferred AI tool (ChatGPT, Claude, etc.)
2. **Customize context** with your specific feature details
3. **Generate documentation** using the structured templates
4. **Review and refine** the AI-generated content
5. **Save to appropriate folders** in the product-management structure

### **Best Practices**
- Always review AI-generated content for accuracy
- Customize prompts for your specific domain knowledge
- Use iterative refinement for complex features
- Validate outputs with team members
- Keep prompt templates updated based on learnings

---

**Next Enhancement**: Implement automated metrics collection and predictive analytics dashboard for continuous process improvement.
