# US-002: Portfolio Alert Configuration Interface

## User Story for Alert Setup and Management

**Date Created**: 2025-01-15  
**Priority**: High  
**Epic**: Portfolio Performance Alerts  
**Linked PRD**: [PRD-2025-06-29-portfolio-alerts.md](../requirements/PRD-2025-06-29-portfolio-alerts.md)  
**Sprint**: 16  
**Story Points**: 8

---

## 📖 User Story

**As a** retail investor using Namaa Investment Platform  
**I want** to easily configure personalized portfolio alerts for my holdings  
**So that** I can stay informed about significant market movements affecting my investments without constantly monitoring the platform

---

## 🎯 Acceptance Criteria

### AC1: Alert Setup Interface

- **Given** I am on the Portfolio Alerts configuration page
- **When** I select an individual stock or portfolio section
- **Then** I should see options to set percentage-based alerts (1%, 2%, 5%, 10%, 15%, 20%)
- **And** I should be able to set custom dollar amount thresholds
- **And** I should be able to choose between gains, losses, or both directions

### AC2: Notification Preferences
- **Given** I am configuring an alert
- **When** I set up notification delivery methods
- **Then** I should be able to select from: in-app notifications, email, SMS, and push notifications
- **And** I should be able to select multiple delivery methods for the same alert
- **And** I should see a preview of how each notification type will appear

### AC3: Quiet Hours Configuration
- **Given** I want to avoid notifications during specific times
- **When** I access the "Quiet Hours" setting
- **Then** I should be able to set start and end times for each day of the week
- **And** I should be able to set different quiet hours for weekdays vs. weekends
- **And** I should be able to override quiet hours for urgent alerts (>10% changes)

### AC4: Alert Management Dashboard
- **Given** I have multiple alerts configured
- **When** I view my Alert Management dashboard
- **Then** I should see all active alerts organized by stock/portfolio section
- **And** I should be able to quickly enable/disable alerts without reconfiguring them
- **And** I should see the last triggered time for each alert

---

## 🔧 Technical Requirements

### Frontend Components Needed
- AlertConfigurationPanel.tsx
- NotificationPreferences.tsx
- QuietHoursSelector.tsx
- AlertManagementDashboard.tsx
- AlertPreview.tsx

### API Endpoints Required
- `POST /api/alerts/create` - Create new alert configuration
- `PUT /api/alerts/{id}` - Update existing alert
- `DELETE /api/alerts/{id}` - Remove alert
- `GET /api/alerts/user/{userId}` - Fetch user's alert configurations
- `POST /api/alerts/test` - Send test notification

### Database Schema Extensions
```sql
CREATE TABLE user_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    alert_type VARCHAR(20) NOT NULL, -- 'percentage', 'dollar_amount'
    threshold_value DECIMAL(10,2) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'gain', 'loss', 'both'
    target_type VARCHAR(20) NOT NULL, -- 'stock', 'sector', 'portfolio'
    target_id VARCHAR(50), -- stock symbol, sector name, or 'portfolio'
    notification_methods TEXT[], -- ['email', 'sms', 'push', 'in_app']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_quiet_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    allow_urgent_override BOOLEAN DEFAULT true
);
```

---

## 🎨 UI/UX Specifications

### Design Requirements
- **Alert Setup**: Clean, intuitive form with real-time preview
- **Threshold Selection**: Slider + manual input for precise control
- **Notification Preview**: Show exactly how each alert type will appear
- **Quick Actions**: One-click enable/disable toggles
- **Visual Hierarchy**: Group related alerts, highlight active ones

### Mobile Considerations
- Touch-friendly alert threshold selectors
- Simplified notification method selection
- Swipe gestures for quick enable/disable
- Responsive alert management cards

---

## 🧪 Testing Scenarios

### Happy Path Testing
1. **Basic Alert Creation**
   - User creates 5% loss alert for AAPL stock
   - Selects email + push notifications
   - Sets quiet hours 10 PM - 7 AM
   - Verifies alert appears in management dashboard

2. **Portfolio-Wide Alert**
   - User creates 2% gain alert for entire portfolio
   - Sets SMS + in-app notifications
   - Tests with portfolio simulation showing 2.1% gain
   - Verifies correct notification delivery

### Edge Case Testing
1. **Overlapping Alerts**
   - User creates 5% and 10% loss alerts for same stock
   - System should send appropriate alert based on threshold reached
   - Cooldown period should prevent duplicate notifications

2. **Quiet Hours Override**
   - Stock drops 12% during user's quiet hours
   - System should override quiet hours for urgent threshold
   - User should receive notification with "urgent override" indicator

### Performance Testing
- Configuration interface should load within 2 seconds
- Alert updates should save within 1 second
- Bulk alert operations (enable/disable multiple) within 3 seconds

---

## 📊 Success Metrics

### Primary KPIs
- **Configuration Completion Rate**: 80% of users who start alert setup complete at least one alert
- **Alert Effectiveness**: 70% of triggered alerts result in user portfolio interaction within 24 hours
- **User Satisfaction**: 4.5+ star rating for alert configuration experience

### Secondary Metrics
- **Time to Configure**: Average time to set up first alert < 3 minutes
- **Alert Maintenance**: 90% of users keep alerts active after 30 days
- **Support Reduction**: 40% decrease in "how do I set alerts" support tickets

---

## 🔗 Dependencies & Risks

### Dependencies
- Real-time market data feed integration
- Push notification service setup (Firebase/APNs)
- SMS service provider integration (Twilio)
- Email template system

### Technical Risks
- **Market Data Latency**: Delays in price data could reduce alert effectiveness
- **Notification Delivery**: Third-party service outages could prevent alert delivery
- **Database Performance**: High-frequency alert checking could impact database performance

### Mitigation Strategies
- Implement redundant market data sources
- Queue notification delivery with retry mechanisms
- Optimize database queries and consider caching strategies

---

## 🚀 Implementation Notes

### Development Approach
1. **Phase 1**: Core alert configuration UI (Sprint 16)
2. **Phase 2**: Notification delivery system (Sprint 17)
3. **Phase 3**: Advanced features (quiet hours, bulk operations) (Sprint 18)

### Code Review Checklist
- [ ] Alert configuration properly validates threshold ranges
- [ ] Notification preferences saved correctly to database
- [ ] Quiet hours logic implemented with timezone considerations
- [ ] Mobile responsive design tested on multiple devices
- [ ] Accessibility standards met (WCAG 2.1 AA)

---

**Related Documents:**
- [PRD-2025-06-29: Portfolio Performance Alerts](../requirements/PRD-2025-06-29-portfolio-alerts.md)
- [Change Request Template](../change-requests/TEMPLATE.md)
- [QA Standards](../quality-assurance/qa-standards.md)
