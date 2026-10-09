import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index, ManyToMany } from 'typeorm'
import { Post } from './Post'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Index({ unique: true })
  @Column()
  username: string

  @Index({ unique: true })
  @Column('varchar', { length: 128, comment: 'Cognito sub (UUID)', nullable: true })
  cognito_sub: string | null

  @Column('varchar', { length: 255, comment: 'メールアドレス', nullable: true })
  email: string | null

  @Column('varchar', { length: 255, comment: 'ニックネーム', nullable: true })
  nickname: string | null

  @Column('varchar', { length: 1024, comment: 'プロフィール', nullable: true })
  profile: string

  @CreateDateColumn({ comment: 'ユーザ登録日時' })
  readonly registered_at: Date

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[]

  @ManyToMany(() => Post, (post) => post.users)
  likes: Post[];
}
