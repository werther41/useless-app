# Repository Protection Guide

This guide explains how to protect your production deployments while maintaining open source collaboration.

## 🔒 Branch Protection Rules

### Main Branch Protection

1. **Go to Repository Settings** → **Branches**
2. **Add Rule** for `main` branch
3. **Enable these protections:**
   - ✅ Require a pull request before merging
   - ✅ Require approvals (set to 1 or 2)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Restrict pushes that create files larger than 100MB

### Environment Protection

1. **Go to Settings** → **Environments**
2. **Create "Production" environment**
3. **Add protection rules:**
   - ✅ Required reviewers (add yourself)
   - ✅ Wait timer (optional: 5 minutes)
   - ✅ Restrict deployments to main branch only

## 🚫 Deployment Restrictions

### Vercel Protection

1. **Vercel Dashboard** → **Project Settings** → **Git**
2. **Production Branch**: Set to `main` only
3. **Preview Branches**: Allow all other branches
4. **Auto-deploy**: Enable only for `main` branch

### Netlify Protection

1. **Netlify Dashboard** → **Site Settings** → **Build & Deploy**
2. **Production Branch**: Set to `main` only
3. **Branch Deploy**: Disable for production
4. **Deploy Hooks**: Use only for authorized deployments

## 👥 Contributor Guidelines

### Required Workflow

1. **Fork the repository**
2. **Create feature branch** from `main`
3. **Make changes** and test locally
4. **Create Pull Request** to `main`
5. **Wait for review** and approval
6. **Maintainer merges** after approval

### PR Requirements

- **Clear description** of changes
- **Testing instructions** for reviewers
- **No breaking changes** without discussion
- **Follow coding standards** and conventions

## 🛡️ Additional Security Measures

### Code Review Requirements

- **Minimum 1-2 reviewers** for main branch
- **Automated checks** must pass
- **No direct pushes** to main branch
- **Squash and merge** only

### Environment Variables

- **Never commit secrets** to repository
- **Use environment variables** for all sensitive data
- **Separate environments** for development and production
- **Regular secret rotation**

### Monitoring and Alerts

- **Deployment notifications** to maintainers
- **Failed build alerts** via email/Slack
- **Performance monitoring** for production
- **Security scanning** for vulnerabilities

## 🚨 Emergency Procedures

### If Unauthorized Changes Deploy

1. **Immediately revert** the problematic commit
2. **Review branch protection** settings
3. **Check deployment logs** for issues
4. **Notify team** of security incident
5. **Update protection rules** if needed

### Rollback Process

1. **Identify last known good commit**
2. **Create hotfix branch** from that commit
3. **Deploy hotfix** to production
4. **Update main branch** with fix
5. **Document incident** and prevention measures

## 📋 Checklist for Repository Protection

### Before Making Public

- [ ] Enable branch protection for `main`
- [ ] Set up required reviewers
- [ ] Configure environment protection
- [ ] Test deployment restrictions
- [ ] Document contributor guidelines
- [ ] Set up monitoring and alerts

### Regular Maintenance

- [ ] Review and update protection rules
- [ ] Monitor deployment logs
- [ ] Update contributor guidelines
- [ ] Review and rotate secrets
- [ ] Test emergency procedures

## 🔗 Useful Links

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Vercel Environment Protection](https://vercel.com/docs/concepts/projects/environments)
- [Netlify Branch Deploy](https://docs.netlify.com/site-deploys/overview/#branch-deploy-context)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)
