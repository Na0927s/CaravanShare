import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Caravan } from "./Caravan";
import { Reservation } from "./Reservation";
import { Review } from "./Review";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  contact!: string;

  @Column({ default: "guest" })
  role!: string;

  @Column({ default: 0 })
  trust_score!: number;

  @Column({
    type: 'varchar',
    default: 'not_verified',
  })
  identity_verification_status!: 'not_verified' | 'pending' | 'verified';

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Caravan, (caravan) => caravan.host)
  caravans!: Caravan[];

  @OneToMany(() => Reservation, (reservation) => reservation.guest)
  reservations!: Reservation[];

  @OneToMany(() => Review, (review) => review.guest)
  reviews!: Review[];
}
