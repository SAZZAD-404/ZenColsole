# 🗄️ Supabase Database Setup

## Quick Start

### Step 1: Run the Fixed Schema
1. Supabase Dashboard এ যান
2. বাম পাশে **SQL Editor** click করুন
3. **New query** click করুন
4. `schema-fixed.sql` file এর সব content copy করুন
5. SQL Editor এ paste করুন
6. **Run** button click করুন (অথবা Ctrl+Enter)

### Step 2: Verify Success
যদি সব ঠিক থাকে, আপনি দেখবেন:

```
✅ ZenConsole database schema created successfully!
📊 Tables created: 15
🔍 Indexes created: 12+
⚡ Triggers created: 11
🎯 Views created: 3
🚀 Ready to use!
```

### Step 3: Check Tables
বাম পাশে **Table Editor** এ যান এবং verify করুন যে এই tables তৈরি হয়েছে:

- ✅ settings
- ✅ provider_connections
- ✅ provider_nodes
- ✅ proxy_pools
- ✅ model_aliases
- ✅ custom_models
- ✅ mitm_alias
- ✅ combos
- ✅ api_keys
- ✅ pricing
- ✅ users
- ✅ user_settings
- ✅ usage_history
- ✅ usage_daily_summary
- ✅ request_logs

## Files

### `schema-fixed.sql` ⭐ (Use This)
- ✅ Error-free version
- ✅ All issues fixed
- ✅ Production-ready
- ✅ Includes DROP statements (safe to re-run)

### `schema.sql` (Original)
- ⚠️ May have issues
- Use `schema-fixed.sql` instead

## Common Issues

### Issue: "functions in index expression must be marked IMMUTABLE"
**Solution**: Use `schema-fixed.sql` instead of `schema.sql`

### Issue: "relation already exists"
**Solution**: `schema-fixed.sql` includes DROP statements, so it's safe to re-run

### Issue: "permission denied"
**Solution**: Make sure you're using the correct Supabase project

## Database Structure

### Core Tables
```
settings              → Global application settings
provider_connections  → OAuth/API key connections
provider_nodes        → Custom compatible endpoints
combos                → Model fallback sequences
api_keys              → Generated API keys
```

### Usage Tracking
```
usage_history         → Detailed request logs
usage_daily_summary   → Pre-aggregated daily stats
request_logs          → Last 1000 requests
```

### User Management
```
users                 → User accounts
user_settings         → User preferences
```

## Next Steps

After running the schema:

1. ✅ Copy your Supabase credentials
2. ✅ Add to `.env.local`
3. ✅ Test locally: `npm run dev`
4. ✅ Deploy to Vercel

See `QUICK_SETUP.md` for complete instructions.

## Support

If you encounter any issues:
1. Check Supabase Dashboard → Logs
2. Verify all environment variables
3. Re-run `schema-fixed.sql`
4. Check browser console for errors

---

**Ready to go! 🚀**
