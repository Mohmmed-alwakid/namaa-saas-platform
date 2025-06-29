# PRD-2025-06-29: Portfolio Performance Alerts
## Real-Time Investment Notifications System

**Document Version**: 1.0  
**Created**: June 29, 2025  
**Product Manager**: [Your Name]  
**Priority**: High  
**Target Release**: Sprint 16 (Q3 2025)

---

## 🎯 Executive Summary

### Business Value
Portfolio Performance Alerts will increase user engagement by 40% and reduce customer support inquiries by 25% by proactively notifying investors of significant market movements affecting their holdings. This feature transforms Namaa from a passive tracking tool into an active investment assistant.

### User Impact
- **Retail Investors**: Never miss critical market movements affecting their portfolios
- **Institutional Investors**: Stay informed of bulk position changes requiring immediate attention
- **Day Traders**: Receive instant notifications for rapid market movements
- **Long-term Investors**: Get alerted to fundamental changes affecting investment thesis

### Success Criteria
- 85% of users enable at least one alert type within 30 days
- 60% reduction in "Why didn't I know about this?" support tickets
- 25% increase in daily active users
- 15% improvement in portfolio performance due to timely actions

---

## 📋 Functional Requirements

### FR1: Alert Configuration
- **FR1.1**: Users can set percentage-based alerts (1%, 2%, 5%, 10%, 15%, 20%)
- **FR1.2**: Users can configure dollar amount thresholds for absolute changes
- **FR1.3**: Users can set alerts for individual stocks, portfolio sectors, or entire portfolio
- **FR1.4**: Users can choose notification delivery methods (in-app, email, SMS, push notifications)
- **FR1.5**: Users can set "quiet hours" to avoid notifications during specific times
- **FR1.6**: Users can configure different alert thresholds for gains vs. losses

### FR2: Real-Time Monitoring
- **FR2.1**: System monitors all user holdings every 30 seconds during market hours
- **FR2.2**: System calculates percentage changes from previous day close, session open, and custom timeframes
- **FR2.3**: System tracks both individual stock performance and portfolio-wide impacts
- **FR2.4**: System considers after-hours trading for extended monitoring (optional user setting)

### FR3: Intelligent Alert Logic
- **FR3.1**: Prevent alert spam by implementing 15-minute cooldown between similar alerts
- **FR3.2**: Escalate alert urgency based on magnitude (>10% = urgent, >5% = important, >2% = standard)
- **FR3.3**: Group related alerts (e.g., "Technology sector down 3% affecting 4 of your holdings")
- **FR3.4**: Provide context with each alert (market trend, sector performance, news correlation)

### FR4: Alert Management
- **FR4.1**: Users can view alert history with timestamps and actions taken
- **FR4.2**: Users can snooze specific alerts for defined periods (1 hour, 4 hours, 1 day)
- **FR4.3**: Users can mark alerts as "acted upon" with optional notes
- **FR4.4**: Users can create custom alert templates for recurring scenarios

---

## ⚡ Non-Functional Requirements

### Performance Requirements
- **NFR1**: Alert generation latency < 2 seconds from market data update
- **NFR2**: In-app notifications appear < 1 second after alert trigger
- **NFR3**: Email notifications delivered < 30 seconds after alert trigger
- **NFR4**: SMS notifications delivered < 60 seconds after alert trigger
- **NFR5**: System handles 10,000+ concurrent users with < 5% performance degradation

### Reliability Requirements
- **NFR6**: 99.9% uptime during market hours (NYSE: 9:30 AM - 4:00 PM ET, Tadawul: 10:00 AM - 3:00 PM AST)
- **NFR7**: < 0.1% false positive rate for alert triggers
- **NFR8**: < 0.01% missed alert rate for configured thresholds
- **NFR9**: Graceful degradation during high market volatility periods

### Security Requirements
- **NFR10**: All alert preferences encrypted at rest using AES-256
- **NFR11**: Alert delivery logs retained for 90 days for audit purposes
- **NFR12**: User notification preferences require authentication to modify
- **NFR13**: Comply with SMS/email privacy regulations (CAN-SPAM, GDPR)

### Scalability Requirements
- **NFR14**: Support 100,000+ user alert configurations
- **NFR15**: Scale to 1 million+ daily alert notifications
- **NFR16**: Horizontal scaling during market volatility spikes

---

## ✅ Acceptance Criteria

```gherkin
Feature: Portfolio Performance Alerts
  As an investor using Namaa Investment Platform
  I want to receive real-time notifications when my investments change significantly
  So that I can make timely decisions and never miss important market movements

Scenario: Setting up basic price alerts
  Given I am logged into Namaa platform
  And I have stocks in my portfolio
  When I navigate to Alert Settings
  And I enable "5% daily change alerts" for my entire portfolio
  And I select "In-app + Email" as notification methods
  Then I should see confirmation "Alerts configured successfully"
  And my alert preferences should be saved and active

Scenario: Receiving significant price drop alert
  Given I have alerts configured for 5% changes
  And I own 100 shares of AAPL at $180/share
  When AAPL drops to $170/share (5.56% decline)
  Then I should receive an in-app notification within 2 seconds
  And I should receive an email within 30 seconds
  And the alert should show "AAPL down 5.56% (-$10.00) affecting your $18,000 position"

Scenario: Managing alert frequency during volatile periods
  Given AAPL is experiencing high volatility
  And I received an alert 10 minutes ago for 5% drop
  When AAPL drops another 2% (now 7% total)
  Then I should NOT receive another alert due to 15-minute cooldown
  But when 15 minutes pass and AAPL drops to 10% total
  Then I should receive an escalated "urgent" alert

Scenario: Portfolio-wide sector alert
  Given I own technology stocks representing 40% of my portfolio
  When the technology sector drops 3% in one day
  Then I should receive a grouped alert saying "Technology sector down 3% affecting 4 of your holdings"
  And the alert should show total dollar impact on my portfolio

Scenario: Customizing quiet hours
  Given I set quiet hours from 10 PM to 7 AM EST
  When a 5% price movement occurs at 2 AM EST
  Then I should NOT receive immediate notifications
  But I should see a summary alert when quiet hours end at 7 AM
  And urgent alerts (>10%) should override quiet hours
```

---

## 🔧 Technical Implementation

### Frontend Components (React 19 + TypeScript)

#### AlertSettingsPage Component
- **Purpose**: Configure alert preferences and thresholds
- **Key Features**: Real-time preview, validation, template management
- **State Management**: Zustand store for alert preferences
- **API Integration**: RESTful calls to alert configuration endpoints

#### AlertNotificationComponent
- **Purpose**: Display in-app notifications with actions
- **Key Features**: Toast notifications, notification center, alert history
- **Real-time Updates**: WebSocket integration for instant alerts
- **User Actions**: Snooze, dismiss, mark as acted upon

#### AlertHistoryDashboard
- **Purpose**: Historical view of all alerts and user actions
- **Key Features**: Filtering, searching, performance analytics
- **Data Visualization**: Charts showing alert frequency and accuracy

### Backend APIs (Supabase + Edge Functions)

#### Alert Configuration API
```typescript
// POST /api/alerts/configure
interface AlertConfiguration {
  userId: string;
  portfolioId?: string;
  stockSymbol?: string;
  thresholdType: 'percentage' | 'dollar';
  threshold: number;
  direction: 'gain' | 'loss' | 'both';
  deliveryMethods: ('in-app' | 'email' | 'sms')[];
  quietHours?: { start: string; end: string; timezone: string };
}
```

#### Real-time Monitoring Service
```typescript
// Supabase Edge Function: market-data-processor
export default async function processMarketData(marketUpdate: MarketUpdate) {
  const affectedUsers = await findUsersWithAlerts(marketUpdate.symbol);
  
  for (const user of affectedUsers) {
    const priceChange = calculatePriceChange(marketUpdate, user.purchasePrice);
    if (shouldTriggerAlert(priceChange, user.alertConfig)) {
      await triggerAlert(user, marketUpdate, priceChange);
    }
  }
}
```

#### Notification Delivery Service
```typescript
// Multi-channel notification dispatcher
interface NotificationPayload {
  userId: string;
  alertType: 'standard' | 'important' | 'urgent';
  message: string;
  actionableData: AlertContext;
  deliveryMethods: string[];
}
```

### Database Schema Changes

#### New Tables
```sql
-- Alert configurations
CREATE TABLE alert_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  portfolio_id UUID REFERENCES portfolios(id),
  stock_symbol TEXT,
  threshold_type TEXT CHECK (threshold_type IN ('percentage', 'dollar')),
  threshold_value DECIMAL(10,2),
  direction TEXT CHECK (direction IN ('gain', 'loss', 'both')),
  delivery_methods TEXT[], -- ['in-app', 'email', 'sms']
  quiet_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert history
CREATE TABLE alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  alert_config_id UUID REFERENCES alert_configurations(id),
  stock_symbol TEXT NOT NULL,
  trigger_price DECIMAL(10,2),
  price_change_percent DECIMAL(5,2),
  price_change_dollar DECIMAL(10,2),
  alert_message TEXT,
  urgency_level TEXT,
  delivery_status JSONB, -- Track delivery across channels
  user_action TEXT, -- 'dismissed', 'snoozed', 'acted_upon'
  user_notes TEXT,
  triggered_at TIMESTAMP DEFAULT NOW()
);
```

### Third-Party Integrations

#### Market Data Providers
- **Primary**: Alpha Vantage for US markets (NYSE, NASDAQ)
- **Secondary**: Tadawul API for Saudi market data
- **Backup**: IEX Cloud for redundancy
- **WebSocket**: Real-time price feeds

#### Notification Services
- **Email**: SendGrid with custom templates
- **SMS**: Twilio with international support
- **Push**: Firebase Cloud Messaging for mobile apps

---

## 📊 Success Metrics

### Primary KPIs
- **User Engagement**: Alert setup rate within 30 days of registration
- **Alert Accuracy**: Percentage of alerts that lead to user action
- **Response Time**: Time from market movement to alert delivery
- **User Satisfaction**: NPS score for alert functionality

### Secondary KPIs
- **Alert Volume**: Daily/weekly alert generation trends
- **Delivery Success Rate**: Percentage of successfully delivered alerts
- **False Positive Rate**: Alerts dismissed without action
- **Performance Impact**: Alert system effect on portfolio performance

### Quality Metrics
- **System Uptime**: Availability during market hours
- **Alert Latency**: P95 response time for alert generation
- **Delivery Speed**: P95 delivery time across all channels
- **Error Rate**: Failed alert processing percentage

---

## 🚨 Risk Assessment

### Technical Risks

#### High-Volume Processing Risk
- **Risk**: System overwhelmed during market volatility
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Implement queue-based processing with auto-scaling
- **Contingency**: Temporary alert throttling during extreme events

#### Real-Time Data Accuracy Risk
- **Risk**: Delayed or incorrect market data leading to false alerts
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Multiple data source redundancy and validation
- **Contingency**: Clear error messaging and alert recall capability

#### Notification Delivery Risk
- **Risk**: SMS/Email delivery failures during critical market events
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Multiple provider redundancy and delivery confirmation
- **Contingency**: In-app notification prioritization and retry logic

### Business Risks

#### User Alert Fatigue Risk
- **Risk**: Too many alerts causing users to disable all notifications
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Smart alert grouping and machine learning optimization
- **Contingency**: User education and default setting optimization

#### Regulatory Compliance Risk
- **Risk**: Notification practices violating financial communication regulations
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Legal review and compliance documentation
- **Contingency**: Rapid feature modification and audit trail

#### Market Data Cost Risk
- **Risk**: High user adoption leading to expensive API usage
- **Probability**: High (positive problem)
- **Impact**: Medium
- **Mitigation**: Tiered alert plans and usage optimization
- **Contingency**: Premium alert features for paid plans

---

## 📅 Implementation Timeline

### Phase 1: Core Alert Infrastructure (Sprint 16-17, 4 weeks)
**Deliverables**:
- Basic alert configuration UI
- Real-time market data integration
- In-app notification system
- Database schema implementation
- Basic percentage-based alerts

**Success Criteria**:
- Users can configure 5% alerts for individual stocks
- In-app notifications delivered < 2 seconds
- System handles 1,000 concurrent users

### Phase 2: Enhanced Features (Sprint 18-19, 4 weeks)
**Deliverables**:
- Email and SMS notifications
- Portfolio-wide alerts
- Alert history and management
- Quiet hours and snooze functionality
- Sector-based grouping

**Success Criteria**:
- Multi-channel notification delivery
- Users can manage alert preferences
- 95% delivery success rate

### Phase 3: AI-Powered Intelligence (Sprint 20-21, 4 weeks)
**Deliverables**:
- Smart alert grouping
- Predictive alert optimization
- Context-aware messaging
- Performance analytics dashboard
- Advanced alert templates

**Success Criteria**:
- 40% reduction in alert fatigue
- 25% improvement in user action rate
- ML-optimized alert thresholds

---

## 🔗 Dependencies

### Internal Dependencies
- **Market Data Integration**: Portfolio tracking system must be stable
- **User Authentication**: Secure user session management required
- **Notification Infrastructure**: Email/SMS delivery system needed
- **Real-time Architecture**: WebSocket implementation for instant updates

### External Dependencies
- **Market Data Providers**: Alpha Vantage, Tadawul API contracts
- **Notification Services**: SendGrid, Twilio service agreements
- **Regulatory Approval**: Compliance team sign-off on notification practices
- **Infrastructure Scaling**: AWS/Supabase capacity planning

---

## 💰 Effort Estimate

### Development Effort
- **Frontend Development**: 120 hours (3 developers × 40 hours)
- **Backend Development**: 160 hours (2 developers × 80 hours)
- **Database Implementation**: 40 hours (1 developer × 40 hours)
- **Integration & Testing**: 80 hours (2 developers × 40 hours)
- **Total Development**: 400 hours (10 weeks with current team)

### Additional Effort
- **UI/UX Design**: 60 hours
- **QA Testing**: 80 hours
- **DevOps & Deployment**: 40 hours
- **Documentation**: 20 hours
- **Total Project**: 600 hours (15 weeks end-to-end)

---

**Priority Level**: High  
**Business Impact**: Revenue-driving feature with strong user retention benefits  
**Technical Complexity**: Medium-High (real-time processing, multi-channel notifications)  
**Recommended Start Date**: July 15, 2025  
**Target Launch Date**: October 30, 2025
