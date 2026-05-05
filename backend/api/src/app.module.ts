import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SolicitudesModule } from './modules/solicitudes/solicitudes.module';
import { ReservasModule } from './modules/reservas/reservas.module';
import { CalendarioModule } from './modules/calendario/calendario.module';
import { BloqueosModule } from './modules/bloqueos/bloqueos.module';
import { HistorialModule } from './modules/historial/historial.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { CentrosModule } from './modules/centros/centros.module';

@Module({
  imports: [
    // Config global desde .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    // TypeORM con MySQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '3306')),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'sis_computo'),
        entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'],
        synchronize: false,   // ← usar schema.sql, no auto-sync en producción
        logging: process.env.NODE_ENV === 'development',
        charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),

    // Módulos del sistema
    AuthModule,
    UsersModule,
    SolicitudesModule,
    ReservasModule,
    CalendarioModule,
    BloqueosModule,
    HistorialModule,
    NotificacionesModule,
    CentrosModule,
  ],
})
export class AppModule { }
