import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const User = model('User', {
    fields: {
      id: field.id.cuid2(),
      name: field.text().optional(),
      email: field.text().unique().optional(),
      emailVerified: field.dateTime().optional().column('email_verified'),
      image: field.text().optional(),
    },
  }).sql({ table: 'users' });

  const Account = model('Account', {
    fields: {
      id: field.id.cuid2(),
      userId: field.text().column('user_id'),
      type: field.text(),
      provider: field.text(),
      providerAccountId: field.text().column('provider_account_id'),
      refresh_token: field.text().optional(),
      access_token: field.text().optional(),
      expires_at: field.int().optional(),
      token_type: field.text().optional(),
      scope: field.text().optional(),
      id_token: field.text().optional(),
      session_state: field.text().optional(),
    },
  })
    .sql({ table: 'accounts' })
    .attributes(({ fields, constraints }) => ({
      uniques: [constraints.unique([fields.provider, fields.providerAccountId])],
    }));

  const Session = model('Session', {
    fields: {
      id: field.id.cuid2(),
      sessionToken: field.text().unique().column('session_token'),
      userId: field.text().column('user_id'),
      expires: field.dateTime(),
    },
  }).sql({ table: 'sessions' });

  const VerificationToken = model('VerificationToken', {
    fields: {
      identifier: field.text(),
      token: field.text(),
      expires: field.dateTime(),
    },
  })
    .sql({ table: 'verification_tokens' })
    .attributes(({ fields, constraints }) => ({
      uniques: [constraints.unique([fields.identifier, fields.token])],
    }));

  return {
    models: {
      User: User.relations({
        accounts: rel.hasMany(Account, { by: 'userId' }),
        sessions: rel.hasMany(Session, { by: 'userId' }),
      }),
      Account: Account.relations({
        user: rel.belongsTo(User, { from: 'userId', to: 'id' }).sql({
          fk: { onDelete: 'cascade' },
        }),
      }),
      Session: Session.relations({
        user: rel.belongsTo(User, { from: 'userId', to: 'id' }).sql({
          fk: { onDelete: 'cascade' },
        }),
      }),
      VerificationToken,
    },
  };
});
